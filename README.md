# DefendFi Dashboard

DefendFi is an institutional-grade SaaS monitoring dashboard for DeFi (Decentralized Finance) and Web3 power users. It provides advanced analytics, risk intelligence, and real-time market insights with a premium, highly responsive user interface.

## 🌟 Key Features

- **Institutional Topbar & Navigation**: Advanced routing with a customized mega-dropdown menu for risk intelligence and research sections.
- **Degen Radar Module**: 
  - **Volatility Heatmap Grid**: Visualized token volatility and market momentum using animated UI components.
  - **Whale Wallet Tracking**: Real-time tracking of institutional and whale wallet movements.
  - **Pump Probability Estimator**: Statistical estimation of token breakout potentials based on on-chain data.
- **Advanced Monitoring Table**: High-performance data tables with column visibility, multi-filtering, and dynamic sorting.
- **Theming System**: Full dark/light mode support using semantic design tokens and smooth transitions.
- **Web3 Integrations**: Wallet connection and blockchain interactions powered by Wagmi, Viem, and RainbowKit.

## 💻 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Web3**: [Wagmi](https://wagmi.sh/), [Viem](https://viem.sh/), [RainbowKit](https://www.rainbowkit.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **State/Data Fetching**: [TanStack Query](https://tanstack.com/query)

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed along with a package manager of your choice (`npm`, `yarn`, `pnpm`, or `bun`).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/elizzwel/defendfi.git
   cd dashboard-defi
   ```

2. Install dependencies (recommended using bun):
   ```bash
   bun install
   ```

3. Run the development server:
   ```bash
   bun dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

- `/src/app` - Next.js app router configuration, pages, layouts, and system configurations.
- `/src/components` - Reusable UI components including isolated modules like `degen-radar` and `topbar`.
- `/src/lib` - Utility functions, custom hooks, typings, and other configurations.

## 📄 License

This project is proprietary and confidential.

---
*Built with passion for the Web3 Ecosystem.*
