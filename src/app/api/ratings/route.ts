import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { TABLES } from '@/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const { restaurant_id, stars, comment } = await req.json();
    if (!restaurant_id || !stars || stars < 1 || stars > 5) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
    }
    const sb = createServerClient();
    const { data, error } = await sb
      .from(TABLES.ratings)
      .insert([{ restaurant_id, stars, comment }])
      .select()
      .single();
    if (error) throw new Error(error.message);

    // تحديث متوسط التقييم
    const { data: ratings } = await sb
      .from(TABLES.ratings)
      .select('stars')
      .eq('restaurant_id', restaurant_id);

    if (ratings) {
      const avg = ratings.reduce((s, r) => s + (r as { stars: number }).stars, 0) / ratings.length;
      await sb
        .from(TABLES.restaurants)
        .update({ rating: avg, total_ratings: ratings.length })
        .eq('id', restaurant_id);
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
