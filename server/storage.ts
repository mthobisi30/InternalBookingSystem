import { resources, bookings, type Resource, type InsertResource, type Booking, type InsertBooking, type BookingWithResource } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, or } from "drizzle-orm";

export interface IStorage {
  // Resources
  getResources(): Promise<Resource[]>;
  getResource(id: number): Promise<Resource | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: number, resource: Partial<InsertResource>): Promise<Resource | undefined>;
  deleteResource(id: number): Promise<boolean>;

  // Bookings
  getBookings(): Promise<BookingWithResource[]>;
  getBooking(id: number): Promise<BookingWithResource | undefined>;
  getBookingsByResource(resourceId: number): Promise<BookingWithResource[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking | undefined>;
  deleteBooking(id: number): Promise<boolean>;
  checkBookingConflict(resourceId: number, startTime: Date, endTime: Date, excludeBookingId?: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Resources
  async getResources(): Promise<Resource[]> {
    return await db.select().from(resources);
  }

  async getResource(id: number): Promise<Resource | undefined> {
    const [resource] = await db.select().from(resources).where(eq(resources.id, id));
    return resource || undefined;
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const [newResource] = await db
      .insert(resources)
      .values(resource)
      .returning();
    return newResource;
  }

  async updateResource(id: number, resource: Partial<InsertResource>): Promise<Resource | undefined> {
    const [updatedResource] = await db
      .update(resources)
      .set(resource)
      .where(eq(resources.id, id))
      .returning();
    return updatedResource || undefined;
  }

  async deleteResource(id: number): Promise<boolean> {
    const result = await db.delete(resources).where(eq(resources.id, id));
    return result.rowCount > 0;
  }

  // Bookings
  async getBookings(): Promise<BookingWithResource[]> {
    return await db
      .select()
      .from(bookings)
      .leftJoin(resources, eq(bookings.resourceId, resources.id));
  }

  async getBooking(id: number): Promise<BookingWithResource | undefined> {
    const [booking] = await db
      .select()
      .from(bookings)
      .leftJoin(resources, eq(bookings.resourceId, resources.id))
      .where(eq(bookings.id, id));
    return booking || undefined;
  }

  async getBookingsByResource(resourceId: number): Promise<BookingWithResource[]> {
    return await db
      .select()
      .from(bookings)
      .leftJoin(resources, eq(bookings.resourceId, resources.id))
      .where(eq(bookings.resourceId, resourceId));
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db
      .insert(bookings)
      .values(booking)
      .returning();
    return newBooking;
  }

  async updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking | undefined> {
    const [updatedBooking] = await db
      .update(bookings)
      .set(booking)
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking || undefined;
  }

  async deleteBooking(id: number): Promise<boolean> {
    const result = await db.delete(bookings).where(eq(bookings.id, id));
    return result.rowCount > 0;
  }

  async checkBookingConflict(resourceId: number, startTime: Date, endTime: Date, excludeBookingId?: number): Promise<boolean> {
    let query = db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.resourceId, resourceId),
          or(
            // New booking starts during existing booking
            and(gte(startTime, bookings.startTime), lte(startTime, bookings.endTime)),
            // New booking ends during existing booking
            and(gte(endTime, bookings.startTime), lte(endTime, bookings.endTime)),
            // New booking completely encompasses existing booking
            and(lte(startTime, bookings.startTime), gte(endTime, bookings.endTime))
          )
        )
      );

    if (excludeBookingId) {
      query = query.where(and(query.where, eq(bookings.id, excludeBookingId)));
    }

    const conflicts = await query;
    return conflicts.length > 0;
  }
}

export const storage = new DatabaseStorage();
