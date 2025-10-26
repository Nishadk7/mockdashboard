import { NextResponse } from 'next/server'
import { getContentStats, getCategories, getSources } from '../../../lib/database'

export async function GET() {
  try {
    const [stats, categories, sources] = await Promise.all([
      getContentStats(),
      getCategories(),
      getSources()
    ])
    
    return NextResponse.json({
      stats,
      categories,
      sources
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json({ error: 'Failed to load statistics' }, { status: 500 })
  }
}
