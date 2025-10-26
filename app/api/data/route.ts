import { NextResponse } from 'next/server'
import { getAllContent, searchContent, getContentStats, getCategories, getSources } from '../../../lib/database'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || 'All'
    const source = searchParams.get('source') || 'All'
    const contentType = searchParams.get('contentType') || ''
    const difficultyLevel = searchParams.get('difficultyLevel') || ''
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined
    
    // Prepare filters
    const filters = {
      category,
      source,
      contentType: contentType || undefined,
      difficultyLevel: difficultyLevel || undefined,
      limit,
      offset
    }
    
    let data
    
    // Search or get all content based on search query
    if (search.trim()) {
      data = searchContent(search, filters)
    } else {
      data = getAllContent(filters)
    }
    
    // Transform data to match frontend expectations
    const transformedData = data.map(item => ({
      Category: item.category,
      URL: item.url,
      Source: item.source,
      Time_Spent_Minutes: item.time_spent_minutes,
      Upvotes: item.upvotes,
      Views: item.views,
      Engagement_Score: item.engagement_score,
      Content_Type: item.content_type,
      Difficulty_Level: item.difficulty_level,
      Trending_Score: item.trending_score,
      id: item.id,
      created_at: item.created_at,
      updated_at: item.updated_at
    }))
    
    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Error fetching data from database:', error)
    return NextResponse.json({ error: 'Failed to load data from database' }, { status: 500 })
  }
}

