# Credenyl - Finance Portfolio Dashboard

Credenyl is a premium finance portfolio management dashboard designed for high-performance data analysis and customer eligibility tracking. The application features a modern, clean aesthetic with a focus on visual data representation and responsive accessibility.

## 🚀 Responsive Design & Breakpoints

The application is optimized for a wide range of devices, ensuring high readability even on complex data tables.

- **Desktop (> 1200px)**: Full navigation sidebar with icons and labels (260px).
- **Tablet / Small Desktop (1025px - 1200px)**: 
  - **Minimized Sidebar**: To maximize space for financial data, the sidebar automatically collapses to an "icons-only" view (80px).
  - **Optimized Content**: Main content shifts dynamically to fill the reclaimed horizontal space.
- **Mobile / Small Tablet (< 1024px)**:
  - **Hidden Sidebar**: The navigation moves to a sliding overlay menu to prioritize portrait viewing.
  - **Swipeable Tables**: Large data tables (Eligibility & Customers) are fully swipeable horizontally, ensuring no data is hidden or aggressively truncated.

## 🛠 Tech Stack

- **Frontend**: React.js with Vite
- **Styling**: Vanilla CSS (Premium Custom Design System)
- **Data Visualization**: Recharts (Customized Donut and Gauge charts)
- **Backend / Database**: Supabase
- **Authentication**: Supabase Auth (Restricted to authenticated users only)

## 🔒 Security & data access

Access to the application and its underlying data is strictly controlled:
- **Authentication**: All dashboard features require a valid login session.
- **Row Level Security (RLS)**: The database is protected by RLS policies that restrict `SELECT` operations to **authenticated users only**.
- **Secure Entry**: Post-login redirection is forced to the main Dashboard to ensure a controlled user flow.

## 📁 Project Structure

```text
src/
├── application/        # Application logic and high-level hooks
├── infrastructure/    # API services, Supabase configuration, and data fetching
├── presentation/      # UI components, pages, context, and CSS
│   ├── components/    # Reusable UI elements (Dashboard, Auth, etc.)
│   └── pages/         # High-level page containers
└── shared/            # Constants, utilities, and global types
```

## 📈 Key UI Features

### Finance Health Overview
Three synchronized health charts provide instant insights into portfolio performance:
1. **Customers Eligibility**: A donut chart breaking down the green/yellow/amber distribution.
2. **Credit Score Health**: A specialized gauge chart visualizing average creditworthiness.
3. **TNx Success Health**: A success rate tracker for financial transactions.

### Customer Management
- **Smart Filtering**: Instant filtering by eligibility status (Green, Yellow, Amber).
- **Infinite Data Visibility**: Optimized tables for 1100px-1200px screens with intelligent column removal (e.g., Mobile Number) to prioritize financial metrics.
- **Customer details Slider**: Deep-dive into specific customer data without leaving the current view.

## 🛠 Installation

```bash
# Install dependencies
npm install

# Setup environment variables
# Create a .env file with your Supabase credentials:
# VITE_SUPABASE_URL=your_url
# VITE_SUPABASE_ANON_KEY=your_key

# Run development server
npm run dev
```
