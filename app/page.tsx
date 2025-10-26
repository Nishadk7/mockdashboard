'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import { 
  Search, 
  TrendingUp, 
  Clock, 
  ThumbsUp, 
  Eye, 
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'

interface ContentData {
  Category: string
  URL: string
  Source: string
  Time_Spent_Minutes: number
  Upvotes: number
  Views: number
  Engagement_Score: number
  Content_Type: string
  Difficulty_Level: string
  Trending_Score: number
}

const COLORS = ['#0ea5e9', '#d946ef', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function Dashboard() {
  const [data, setData] = useState<ContentData[]>([])
  const [filteredData, setFilteredData] = useState<ContentData[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedSource, setSelectedSource] = useState('All')
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])
  const [sources, setSources] = useState<string[]>([])

  // Function to fetch metadata (categories and sources)
  const fetchMetadata = async () => {
    try {
      const response = await fetch('/api/stats')
      if (response.ok) {
        const metadata = await response.json()
        setCategories(metadata.categories || [])
        setSources(metadata.sources || [])
      }
    } catch (error) {
      console.error('Error loading metadata:', error)
    }
  }

  // Function to fetch data with filters
  const fetchData = async (search = '', category = 'All', source = 'All') => {
    try {
      setIsLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams()
      if (search.trim()) params.append('search', search.trim())
      if (category !== 'All') params.append('category', category)
      if (source !== 'All') params.append('source', source)
      
      const url = `/api/data${params.toString() ? '?' + params.toString() : ''}`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setData(data)
      setFilteredData(data)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load initial data and metadata
  useEffect(() => {
    fetchMetadata()
    fetchData()
  }, [])

  // Handle search and filter changes
  useEffect(() => {
    fetchData(searchTerm, selectedCategory, selectedSource)
  }, [searchTerm, selectedCategory, selectedSource])


  // Calculate aggregated data for charts
  const categoryStats = categories.map(category => {
    const categoryData = filteredData.filter(item => item.Category === category)
    return {
      category,
      avgTimeSpent: categoryData.length > 0 ? categoryData.reduce((sum, item) => sum + item.Time_Spent_Minutes, 0) / categoryData.length : 0,
      totalUpvotes: categoryData.reduce((sum, item) => sum + item.Upvotes, 0),
      totalViews: categoryData.reduce((sum, item) => sum + item.Views, 0),
      avgEngagement: categoryData.length > 0 ? categoryData.reduce((sum, item) => sum + item.Engagement_Score, 0) / categoryData.length : 0,
      count: categoryData.length
    }
  })

  const topContent = [...filteredData]
    .sort((a, b) => b.Time_Spent_Minutes - a.Time_Spent_Minutes)
    .slice(0, 10)

  const topUpvoted = [...filteredData]
    .sort((a, b) => b.Upvotes - a.Upvotes)
    .slice(0, 10)

  const sourceDistribution = sources.map(source => {
    const sourceData = filteredData.filter(item => item.Source === source)
    return {
      source,
      count: sourceData.length,
      percentage: filteredData.length > 0 ? (sourceData.length / filteredData.length) * 100 : 0
    }
  })

  const totalMetrics = {
    totalContent: filteredData.length,
    avgTimeSpent: filteredData.length > 0 ? filteredData.reduce((sum, item) => sum + item.Time_Spent_Minutes, 0) / filteredData.length : 0,
    totalUpvotes: filteredData.reduce((sum, item) => sum + item.Upvotes, 0),
    totalViews: filteredData.reduce((sum, item) => sum + item.Views, 0)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Fashion Dashboard</h1>
              <p className="text-gray-600 mt-1">Business Intelligence for Fashion Content Analytics</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="btn-secondary flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </button>
              <button className="btn-primary flex items-center">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="card">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search categories, sources, or content types..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-field"
                >
                  <option value="All">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="input-field"
                >
                  <option value="All">All Sources</option>
                  {sources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="metric-card">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Clock className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Time Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalMetrics.avgTimeSpent.toFixed(1)}m
                </p>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center">
              <div className="p-2 bg-secondary-100 rounded-lg">
                <ThumbsUp className="h-6 w-6 text-secondary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Upvotes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalMetrics.totalUpvotes.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalMetrics.totalViews.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Content</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalMetrics.totalContent}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Category Performance */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="category" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avgTimeSpent" fill="#0ea5e9" name="Avg Time (min)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Source Distribution */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Source Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ source, percentage }) => `${source} (${percentage.toFixed(1)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {sourceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Content Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Most Time Spent */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Time Spent Content</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Content
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time (min)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topContent.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                        {item.Category}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.Time_Spent_Minutes.toFixed(1)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {item.Source}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Highest Upvoted */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Highest Upvoted Content</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Content
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Upvotes
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topUpvoted.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                        {item.Category}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.Upvotes}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {item.Source}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Engagement Trends */}
        <div className="mt-8">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Score Trends by Category</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={categoryStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="avgEngagement" 
                    stroke="#0ea5e9" 
                    fill="#0ea5e9" 
                    fillOpacity={0.3}
                    name="Avg Engagement Score"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
