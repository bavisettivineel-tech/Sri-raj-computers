import { supabase } from "@/integrations/supabase/client";

/**
 * Automatically cleans up old orders based on their status:
 * - Delivered orders are deleted after 1 week.
 * - Cancelled orders are deleted after 1 day.
 */
export const cleanupOldOrders = async () => {
  try {
    const now = new Date();
    
    // 1. Calculate cutoff for delivered orders (7 days ago)
    const deliveredCutoff = new Date(now);
    deliveredCutoff.setDate(now.getDate() - 7);
    
    // 2. Calculate cutoff for cancelled orders (1 day ago)
    const cancelledCutoff = new Date(now);
    cancelledCutoff.setDate(now.getDate() - 1);

    console.log('Starting order cleanup...');

    // Delete delivered orders older than 1 week
    const { error: deliveredError, count: deliveredCount } = await supabase
      .from('orders')
      .delete({ count: 'exact' })
      .eq('order_status', 'delivered')
      .lt('updated_at', deliveredCutoff.toISOString());

    if (deliveredError) {
      console.error('Error cleaning up delivered orders:', deliveredError.message);
    } else if (deliveredCount) {
      console.log(`Cleaned up ${deliveredCount} delivered orders.`);
    }

    // Delete cancelled orders older than 1 day
    const { error: cancelledError, count: cancelledCount } = await supabase
      .from('orders')
      .delete({ count: 'exact' })
      .eq('order_status', 'cancelled')
      .lt('updated_at', cancelledCutoff.toISOString());

    if (cancelledError) {
      console.error('Error cleaning up cancelled orders:', cancelledError.message);
    } else if (cancelledCount) {
      console.log(`Cleaned up ${cancelledCount} cancelled orders.`);
    }

    console.log('Order cleanup finished.');
  } catch (error) {
    console.error('Unexpected error during order cleanup:', error);
  }
};
