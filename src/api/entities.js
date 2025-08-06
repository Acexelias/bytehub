// entities.js
// This module defines simple data access helpers for your Supabase tables.
// Each entity exposes methods for listing, filtering, creating, updating and
// deleting rows. See individual methods for usage details.

import { supabase } from './supabaseClient';

/**
 * Helper to build an entity API for a given table. Each API includes:
 *  - list(order): return all rows, optionally sorted by a column. Pass
 *    '-column' for descending order.
 *  - filter(criteria, order): filter rows by exact match on the given
 *    criteria object. You can also specify an order string as above.
 *  - create(values): insert a new row and return the inserted record.
 *  - update(id, values): update a row by primary key and return the
 *    updated record.
 *  - delete(id): delete a row by primary key and return true on success.
 */
function createEntityAPI(tableName) {
  return {
    /**
     * Fetch all records. Optionally provide an order string (e.g. '-created_date').
     * @param {string} [order] Column name prefixed with '-' for descending.
     */
    async list(order) {
      let query = supabase.from(tableName).select('*');
      if (order) {
        const ascending = !order.startsWith('-');
        const col = ascending ? order : order.slice(1);
        query = query.order(col, { ascending });
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    /**
     * Fetch records matching all fields in the provided criteria object.
     * To order results, pass a second parameter identical to list().
     * @param {Object} criteria Key/value pairs to filter on.
     * @param {string} [order] Column name prefixed with '-' for descending.
     */
    async filter(criteria = {}, order) {
      let query = supabase.from(tableName).select('*');
      for (const key of Object.keys(criteria)) {
        const value = criteria[key];
        if (value === null || value === undefined) {
          query = query.is(key, null);
        } else {
          query = query.eq(key, value);
        }
      }
      if (order) {
          const ascending = !order.startsWith('-');
          const col = ascending ? order : order.slice(1);
          query = query.order(col, { ascending });
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    /**
     * Insert a new record. Returns the inserted row with any default fields.
     * @param {Object} values Record values to insert.
     */
    async create(values) {
      const { data, error } = await supabase.from(tableName)
        .insert(values)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    /**
     * Update a record by id. Returns the updated record.
     * @param {string|number} id Primary key of the record.
     * @param {Object} values Fields to update.
     */
    async update(id, values) {
      const { data, error } = await supabase.from(tableName)
        .update(values)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    /**
     * Delete a record by id.
     * @param {string|number} id Primary key of the record.
     */
    async delete(id) {
      const { error } = await supabase.from(tableName)
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    },
  };
}

// Define entity APIs for each table. Adjust table names to match your database.
export const Lead = createEntityAPI('leads');
export const LeadRequest = createEntityAPI('lead_requests');
export const Sale = createEntityAPI('sales');
export const Resource = createEntityAPI('resources');
export const Announcement = createEntityAPI('announcements');
export const SupportTicket = createEntityAPI('support_tickets');
export const AppConfiguration = createEntityAPI('app_configurations');

// User API is special because it needs to talk to Supabase Auth for the
// currently signed-in user. It also queries the `users` table for profile
// information (e.g. role, full_name) based on the user email.
export const User = {
  /**
   * Fetch all users in the `users` table.
   */
  async list() {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return data || [];
  },
  /**
   * Return the currently authenticated user combined with their profile
   * information from the `users` table, if available. Returns null if
   * no session exists.
   */
  async me() {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    const authUser = session?.user;
    if (!authUser) return null;
    // Attempt to fetch extended profile data from the users table using email.
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('email', authUser.email)
      .maybeSingle();
    // Merge auth and profile data. Profile fields override auth metadata.
    const combined = {
      id: authUser.id,
      email: authUser.email,
      ...authUser.user_metadata,
      ...(profile || {}),
    };
    if (profileError) {
      // Profile may not exist yet; return auth metadata only.
      return combined;
    }
    return combined;
  },
  /**
   * Update a user's profile in the `users` table by id.
   * @param {string|number} id The primary key of the profile row.
   * @param {Object} values Fields to update.
   */
  async update(id, values) {
    const { data, error } = await supabase.from('users')
      .update(values)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },
};