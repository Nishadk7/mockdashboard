# HUED Fashion Dashboard - Business Intelligence

## 🚀 Features

### Core Visualizations
- **Most Time Spent Content**: Identify which fashion topics engage users the longest
- **Most Viewed Topics**: Track content popularity across different categories
- **Highest Upvoted Issues**: Discover the most valuable content for users
- **Category Performance**: Compare engagement across fashion categories
- **Source Distribution**: Analyze content performance by platform (Instagram, TikTok, Substack)

### Interactive Features
- **Real-time Search**: Intuitive search across categories, sources, and content types
- **Advanced Filtering**: Filter by category and source for focused analysis
- **Responsive Design**: Optimized for desktop and mobile viewing
- **Export Capabilities**: Download data for further analysis

### Business Intelligence
- **Engagement Scoring**: Calculated metrics combining time spent, upvotes, and views
- **Trending Analysis**: Identify emerging fashion topics and trends
- **Performance Metrics**: Track key KPIs for business decision-making

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 with React 18
- **Styling**: Tailwind CSS with custom design system
- **Charts**: Recharts for interactive data visualization
- **Icons**: Lucide React for consistent iconography
- **TypeScript**: Full type safety throughout the application

## 📊 Data Structure

The dashboard works with enhanced fashion content data including:

- **Content Metadata**: Category, URL, Source, Content Type
- **Engagement Metrics**: Time Spent, Upvotes, Views, Engagement Score
- **Classification**: Difficulty Level, Trending Score
- **Platform Data**: Instagram, TikTok, Substack content

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fashion-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
fashion-dashboard/
├── app/
│   ├── api/
│   │   └── data/
│   │       └── route.ts          # API endpoint for data
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout component
│   └── page.tsx                  # Main dashboard page
├── enhanced_fashion_data.csv     # Enhanced dataset with metrics
├── ARCHITECTURE.md               # Detailed architecture documentation
├── architecture_diagram.md       # Visual architecture diagrams
├── package.json                  # Dependencies and scripts
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file for environment-specific configuration:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Data Source
DATA_SOURCE_PATH=./enhanced_fashion_data.csv
```

## 📈 Usage Guide

## 📊 Data Flow

```
[Social Media Platforms] → [Data Collection] → [Processing] → [Enhanced Dataset]
                                                                      ↓
[Business Users] ← [Web Dashboard] ← [API Layer] ← [Data Storage]
```


## 📚 Additional Resources

- [Architecture Documentation](./ARCHITECTURE.md)
- [Data Flow Diagrams](./docs/DATA_FLOW.md)
- [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)

