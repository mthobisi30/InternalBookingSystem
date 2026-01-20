import { resources, bookings, type Resource, type InsertResource, type Booking, type InsertBooking, type BookingWithResource } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, or, ne, not } from "drizzle-orm";

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
    return (result.rowCount ?? 0) > 0;
  }

  // Bookings
  async getBookings(): Promise<BookingWithResource[]> {
    return await db
      .select()
      .from(bookings)
      .leftJoin(resources, eq(bookings.resourceId, resources.id)) as BookingWithResource[];
  }

  async getBooking(id: number): Promise<BookingWithResource | undefined> {
    const [booking] = await db
      .select()
      .from(bookings)
      .leftJoin(resources, eq(bookings.resourceId, resources.id))
      .where(eq(bookings.id, id)) as BookingWithResource[];
    return booking || undefined;
  }

  async getBookingsByResource(resourceId: number): Promise<BookingWithResource[]> {
    return await db
      .select()
      .from(bookings)
      .leftJoin(resources, eq(bookings.resourceId, resources.id))
      .where(eq(bookings.resourceId, resourceId)) as BookingWithResource[];
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
    return (result.rowCount ?? 0) > 0;
  }

  async checkBookingConflict(resourceId: number, startTime: Date, endTime: Date, excludeBookingId?: number): Promise<boolean> {
    const conditions = [
      eq(bookings.resourceId, resourceId),
      or(
        // New booking starts during existing booking
        and(lte(bookings.startTime, startTime), gte(bookings.endTime, startTime)),
        // New booking ends during existing booking
        and(lte(bookings.startTime, endTime), gte(bookings.endTime, endTime)),
        // New booking completely encompasses existing booking
        and(gte(bookings.startTime, startTime), lte(bookings.endTime, endTime))
      )
    ];

    if (excludeBookingId) {
      // @ts-ignore
      conditions.push(not(eq(bookings.id, excludeBookingId)));
    }

    const [conflict] = await db
      .select()
      .from(bookings)
      .where(and(...conditions));

    return !!conflict;
  }
}

export const storage = new DatabaseStorage();
