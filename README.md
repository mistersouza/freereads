# FreeReads Berlin

![FreeReads Berlin](https://res.cloudinary.com/dhlhrakma/image/upload/w_1000,ar_16:9,c_fill,g_auto,e_sharpen/v1744046629/freereads/readme/freereads_logo_x0zhif.png)

## 📚 Project Overview

FreeReads enables Berlin residents to:

- **📍 Locate nearby book hubs** across the city
- **📚 Browse available books**, both citywide and in their vicinity
- **🧰 Manage donated books** for better tracking and accessibility
- **🤝 Contribute to a community library** that everyone can enjoy

Our mission is to create a seamless platform where anyone in Berlin can discover and access quality reading material—completely free of charge.

## 🏗 Architecture

![FreeReads Architecture](https://res.cloudinary.com/dhlhrakma/image/upload/v1744225616/freereads/readme/freereads_simplified-architecture-diagram_yinesn.png)

FreeReads follows a modern, containerized microservices architecture optimized for scalability and performance:

- **NGINX Layer**: Reverse proxy handling SSL, load balancing, and security headers
- **Node.js/Express Layer**: RESTful API with business logic and authentication
- **Redis Layer**: High-performance caching, token blacklisting, and rate limiting
- **MongoDB Layer**: Document database with geospatial capabilities for hub location

## 🛠️ Tech Stack

- **Backend**: Node.js/Express RESTful API
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based auth with separate access/refresh tokens and blacklisting
- **Documentation**: OpenAPI/Swagger for interactive API documentation
- **Validation**: Input validation and error handling middleware
- **Caching**: Redis for performance optimization and token blacklisting
- **Cloud Services**: Google Cloud for book scanning and ISBN detection
- **Infrastructure**: Docker, NGINX for production deployment
- **CI/CD**: GitHub Actions pipeline with automated testing and deployment
- **Hosting**: Render Cloud Platform

## 🌟 Key Features

- **Geospatial Book Hub Locator**: Find the nearest places to pick up or drop off books
- **Book Scanning API**: Easily add books to the system by scanning barcodes or ISBN using Google Cloud Vision
- **User Authentication**: Secure login, registration, and token refresh system with JWT
- **Role-Based Access Control**: Different permission levels (member, boss, overlord)
- **Real-time Availability**: Up-to-date information on book availability
- **Comprehensive API Documentation**: Fully documented with interactive Swagger/OpenAPI interface

## 🤖 AI & Computer Vision

FreeReads leverages artificial intelligence to enhance the book-sharing experience:

### Current Implementation

- **Google Cloud Vision Integration**
  - Automatic ISBN detection from book cover images
  - Text recognition technology to extract book identifiers
  - Seamless integration with Google Books API for metadata
  - User-friendly scanning experience with minimal input required

### Future AI Enhancements

As part of my ongoing deep learning studies at TechLabs, I plan to develop:

- **Custom Computer Vision Models** tailored specifically for book recognition
- **Natural Language Processing** for book categorization and recommendation
- **Personalized Recommendation Engine** based on borrowing patterns
- **Book Condition Assessment** using image analysis

This AI integration demonstrates practical machine learning implementation skills while laying the groundwork for more advanced custom solutions that will make FreeReads an increasingly intelligent platform.

## 🚀 Project Roadmap

FreeReads is an evolving platform with ambitious plans for growth and innovation:

### Immediate Development Plans

- **React Frontend Implementation** (In Progress)
  - Modern, responsive UI built with React
  - Material UI component library for consistent design
  - State management with Redux or Context API
  - Progressive Web App (PWA) capabilities for offline access
  - Geospatial visualization of book hubs on interactive maps

### Deep Learning Integration (Q3-Q4 2025)

As part of my upcoming TechLabs Deep Learning track studies, I plan to integrate advanced AI capabilities:

- **Book Recommendation Engine**
  - Collaborative filtering based on user borrowing patterns
  - Content-based recommendations using book metadata
  - Hybrid recommendation approach for cold-start problems
  - Personalized reading suggestions based on past activity

- **Natural Language Processing**
  - Book description analysis for improved categorization
  - Sentiment analysis of book reviews
  - Automated genre classification from book content
  - Text summarization for book descriptions

### AI Enhancements (Q1-Q2 2026)

Following the deep learning track, I'll be applying specialized AI knowledge to:

- **Computer Vision Improvements**
  - Book cover recognition without ISBN
  - Condition assessment from book images
  - Automated categorization based on visual elements
  - Multi-book detection in a single image

- **Predictive Analytics**
  - Book availability forecasting
  - Hub usage pattern analysis
  - Seasonal trend identification
  - Demand-based hub location suggestions

### Mobile Application (Q3-Q4 2026)

The ultimate goal is to transform FreeReads into a comprehensive mobile experience:

- **Cross-Platform Mobile App**
  - React Native implementation for iOS and Android
  - Native device feature integration (camera, GPS, notifications)
  - Offline-first architecture with synchronization
  - Barcode/QR code scanning for quick book checkout

## 🚀 Scalability Architecture

FreeReads is built with horizontal scaling capabilities to handle growing demand:

- **Stateless Application Design**
  - Containerized services with Docker
  - JWT authentication eliminating server-side sessions
  - Independent application instances without shared local state
  - NGINX load balancing across multiple containers

- **Distributed Infrastructure**
  - Redis for centralized token blacklisting and rate limiting
  - MongoDB with sharding capabilities for database scaling
  - Geospatial indexing optimized for location-based queries
  - Connection pooling for efficient resource management

- **Cloud-Native Deployment**
  - Auto-scaling configuration on Render platform
  - Zero-downtime deployment pipeline
  - Environment-specific configuration
  - Infrastructure as code for consistent environments

This architecture allows FreeReads to scale horizontally by adding more application instances as user demand grows, rather than being limited to vertical scaling of individual servers.

## 🔒 Security & Performance

FreeReads implements industry best practices for:

### Advanced Security Architecture

- **Multi-Layered JWT Authentication**:
  - Dual token system with short-lived access tokens (15 min) and longer refresh tokens (7 days)
  - Token rotation on every refresh for enhanced security
  - Redis-backed token blacklisting with TTL-based expiration
  - Automatic invalidation on logout, refresh, and security events

- **Comprehensive Abuse Prevention**:
  - Tiered rate limiting based on authentication status
  - Progressive request throttling with increasing delays
  - IP blacklisting after excessive failed attempts
  - Failed login tracking with temporary account lockouts

- **Request Validation & Protection**:
  - Thorough input validation for all endpoints
  - Configurable CORS with strict origin policies
  - Security headers (CSP, XSS Protection, Frame Options)
  - Sanitized error responses to prevent information leakage

### Performance Engineering

- **Advanced Caching Architecture**
  - Multi-tiered Redis implementation with atomic operations
  - Intelligent reconnection strategy with exponential backoff
  - Prefix-based namespace isolation and TTL-based expiration
  - Graceful degradation with in-memory fallbacks

- **Sophisticated Database Optimization**
  - Geospatial indexing and queries for location-based features
  - Strategic MongoDB indexing including compound and text indexes
  - Query optimization with projection, lean queries, and pre-aggregation
  - Efficient document structure with appropriate denormalization

- **Request Processing Optimization**
  - Intelligent middleware sequencing with early termination
  - Dynamic rate limiting based on authentication status
  - Parallel processing for external API calls
  - Efficient error handling and resource management

## 🧪 Code Quality & Testing

FreeReads maintains high code quality standards through:

- **Comprehensive Testing Suite**
  - Unit tests with Jest (80%+ coverage)
  - Integration tests for API endpoints
  - End-to-end testing for critical user flows
  - Automated testing in CI/CD pipeline

- **Code Quality Tools**
  - ESLint with Airbnb style guide
  - Prettier for consistent formatting
  - TypeScript for enhanced type safety (in progress)
  - Pre-commit hooks for quality enforcement

- **Development Practices**
  - Structured code review process
  - Pull request templates and guidelines
  - Comprehensive JSDoc documentation
  - Architecture decision records for key choices

These practices ensure maintainable, reliable code that can evolve with changing requirements while maintaining high quality standards.

## 📖 Documentation

FreeReads provides comprehensive documentation to help developers understand and integrate with the platform:

![FreeReads API Documentation](https://res.cloudinary.com/dhlhrakma/image/upload/w_1000,ar_16:9,c_fill,g_auto,e_sharpen/v1744055268/freereads/readme/freereads_swagger_sj7c74.png)

- **Interactive API Explorer**: [Live Swagger Documentation](https://freereads-lof1.onrender.com/) - Test endpoints directly in your browser
- **Backend Architecture**: [Backend Documentation](WD-BE/README.md) - Detailed guide to the API architecture and implementation
- **Development Guide**: Instructions for local setup and contribution

The Swagger documentation provides complete information about all available endpoints, request/response formats, authentication requirements, and error handling - making integration straightforward for frontend developers.

## 🔧 Development

### Prerequisites

- Node.js (v14+)
- MongoDB
- Redis (optional for development, recommended for production)
- Google Cloud account (for book scanning features)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/mistersouza/freereads.git
cd freereads

# Install dependencies
cd WD-BE
npm install

# Set up environment variables
cp .env.example .env.development.local
# Edit .env.development.local with your configuration

# Start the development server
npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 About the Developer

FreeReads Berlin was developed by [Thiago Souza](https://github.com/mistersouza) as a portfolio project demonstrating full-stack development skills, API design, and community-focused application architecture.