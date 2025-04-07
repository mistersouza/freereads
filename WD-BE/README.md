# FreeReads Berlin API

This is the backend service powering FreeReads Berlin, a community book-sharing platform. The API provides all the functionality needed to locate book hubs, manage books, and handle user authentication.

## 📋 Table of Contents

- [Architecture](#-architecture)
- [Infrastructure Layer](#-infrastructure-layer)
- [Services Initialization](#-services-initialization)
- [Middleware Architecture](#-middleware-architecture)
- [Error Handling System](#-error-handling-system)
- [Security Implementation](#-security-implementation)
- [AI Integration & Computer Vision](#-ai-integration--computer-vision)
- [Performance Engineering](#-performance-engineering)
- [Scalability Considerations](#-scalability-considerations)
- [Code Quality & Testing](#-code-quality--testing)
- [API Documentation](#-api-documentation)
- [Setup and Installation](#-setup-and-installation)
- [Development Guide](#-development-guide)
- [Testing](#-testing)
- [Deployment](#-deployment)

## 🏗 Architecture

![FreeReads Architecture](https://res.cloudinary.com/dhlhrakma/image/upload/v1744051339/freereads/readme/freereads_architecture-diagram_pytuhq.png)

The backend follows a modern, containerized microservices architecture optimized for scalability and performance:

### System Components

#### 1. NGINX Layer (Reverse Proxy)
- Entry point for all client requests
- SSL termination and load balancing
- Static content delivery with caching
- Security headers and rate limiting

#### 2. Node.js/Express Application Layer
- RESTful API endpoints
- Business logic processing
- Authentication and authorization
- Data validation and error handling

#### 3. Redis Layer
- High-performance caching
- Session management
- Token blacklisting
- Rate limiting support

#### 4. MongoDB Layer
- Document-based data storage
- Geospatial queries for hub location
- Relationship management between entities
- Indexing for performance optimization

#### 5. Google Cloud Services
- Vision API for image processing
- Book metadata lookup via ISBN
- Service account authentication

### Data Models

The application uses the following core data models:

#### User Model
- Authentication credentials (email, hashed password)
- Role-based permissions (member, boss, overlord)
- Book ownership tracking
- Timestamps for creation and updates
- Password hashing with bcrypt (12 salt rounds)
- Method for secure password comparison

#### Book Model
- Book metadata (title, author, releaseYear, genre, ISBN)
- Availability status (automatically calculated)
- Copies count
- Description and thumbnail URL
- Hub references for location tracking
- Timestamps for creation and updates
- Pre-save middleware to update availability status

#### Hub Model
- Geographic location data (GeoJSON Point)
- Address information (street, postcode)
- Book inventory with availability status
- Automatic geocoding on address changes using OpenStreetMap
- Geospatial indexing for location-based queries
- Timestamps for creation and updates
- Pre-save middleware to update book availability status

## 🏢 Infrastructure Layer

The application features a robust infrastructure layer that handles database connections, caching, and rate limiting:

### Database Infrastructure

Located in `infrastructure/database/index.js`:

- **MongoDB Connection**:
  - Asynchronous connection setup with proper error handling
  - Environment-specific configuration (development, production, test)
  - Informative logging of connection status
  - Graceful error handling for connection failures

### Redis Infrastructure

The Redis infrastructure is divided into three components:

#### Redis Client (`infrastructure/redis/client.js`)
- **Smart Connection Management**:
  - Custom reconnection strategy with exponential backoff
  - Maximum retry delay of 2000ms
  - Comprehensive event handling (connect, error, reconnecting)
  - Connection status logging

- **Connection Establishment**:
  - `connectRedis()` function for establishing Redis connections
  - Automatic connection status reporting
  - Environment-based configuration

#### Redis Store (`infrastructure/redis/store.js`)
- **Rate Limiting Store**:
  - Integration with `rate-limit-redis` package
  - Custom command handling with error management
  - Prefix-based namespace isolation (`rate-control`)
  - Fallback mechanism for when Redis is unavailable

#### Redis Integration (`infrastructure/redis/index.js`)
- **Unified Exports**:
  - Clean API for accessing Redis functionality
  - Centralized access to client, connection, and store functionality

### Infrastructure Integration

The infrastructure components are initialized during application bootstrap and made available throughout the application:

- **Database Connectivity**: Ensures all data operations have a stable connection
- **Redis Availability**: Provides caching, session management, and rate limiting capabilities
- **Graceful Degradation**: Application can function with reduced capabilities if Redis is unavailable
- **Environment Awareness**: Different configurations for development, testing, and production

## 🔄 Services Initialization

The application employs a structured bootstrapping process to initialize and connect all services:

### Bootstrap Process

Located in `init/index.js` and `init/services.js`:

- **Orchestrated Startup**:
  - `bootstrapServices()` function coordinates the entire initialization process
  - Proper sequencing ensures dependencies are available before dependent services
  - Comprehensive error handling with graceful shutdown on critical failures
  - Informative logging throughout the startup process

- **Connection Sequence**:
  - Database connections established first (MongoDB)
  - Cache services initialized next (Redis)
  - Application services bootstrapped after infrastructure is ready

### Core Services

The application initializes several key services during bootstrap:

#### Blacklist Service
- Manages token invalidation and IP-based request blocking
- Tracks failed login attempts and API abuse
- Implements temporary and permanent blacklisting strategies
- Redis-backed for persistence across application restarts

#### JWT Service
- Handles token generation, verification, and management
- Implements separate access and refresh token strategies
- Configurable token lifetimes and secret keys
- Token extraction and validation utilities

#### Request Control Service
- Manages rate limiting and request throttling
- Implements tiered limits based on authentication status
- Configurable windows, limits, and delay parameters
- Redis-backed for distributed rate limiting

#### Book Service
- Handles book-related business logic
- Implements ISBN lookup and scanning capabilities
- Manages book availability and inventory
- Integrates with Google Cloud Vision for image processing

#### Hub Service
- Manages book hub locations and inventory
- Implements geospatial queries for location-based searches
- Handles address geocoding and coordinate management
- Tracks book availability across hubs

#### User Service
- Manages user accounts and authentication
- Implements role-based access control
- Handles secure password management
- Tracks user-book relationships

### Service Integration

Services are made available throughout the application via dependency injection:

- **Express Integration**:
  - Services attached to `app.locals.services` during initialization
  - Controllers access services through the request object
  - Consistent service access pattern across the application

- **Error Handling**:
  - Centralized error handling through the error service
  - Custom error classes for different error types
  - Consistent error response format
  - Detailed logging with appropriate severity levels

- **Graceful Degradation**:
  - Services implement fallback mechanisms when dependencies are unavailable
  - Non-critical service failures don't crash the application
  - Informative logging helps diagnose and address issues

## 🛡️ Middleware Architecture

The API employs a sophisticated middleware system to handle authentication, validation, rate limiting, and request control:

### Authentication Middleware

Located in `authenticate-user.js` and `auth-middleware.js`, these components provide:

- **JWT-powered Authentication**: 
  - `authenticateUser()` factory function that creates middleware with configurable authentication requirements
  - `loadAuthenticatedUser`: Enforces mandatory authentication, rejecting requests without valid tokens
  - `loadAuthorizedUser`: Optional authentication that allows requests to proceed even without tokens

- **Access Control**:
  - `authorizeAccess()` factory function that creates middleware for role and ownership-based authorization
  - Role-based permissions (boss, overlord) for administrative actions
  - Resource ownership verification using Mongoose models
  - Automatic 403 Forbidden responses for unauthorized access attempts

### Validation Middleware

Located in `validate-middleware.js`, this system provides:

- **Dynamic Input Validation**:
  - Factory pattern with `validate()` function that accepts custom express-validator rules
  - Specialized validators for different entity types (users, books, hubs, scans)
  - Smart error detection that distinguishes between missing required fields and format errors
  - Consistent error responses with detailed validation feedback

- **Specialized Validators**:
  - `validateMember`: Validates user email and password
  - `validateToken`: Validates refresh token requests
  - `validateScan`: Validates book scanning inputs (imageUrl, ISBN)
  - `validateBook`: Validates book creation/update inputs

### Traffic Control Middleware

Located in `limit-middleware.js` and integrated with authentication:

- **Smart Rate Limiting**:
  - `limitTraffic` array combines authentication awareness with rate limiting
  - Tiered rate limits based on authentication status
  - Different limits for anonymous users, authenticated users, and trusted IPs

- **Progressive Slowdown**:
  - Gradually increases response delay for suspicious activity
  - Configurable thresholds and delay parameters
  - Works alongside rate limiting for enhanced protection

### Blacklist Middleware

Located in `blacklist-middleware.js`:

- **IP-based Protection**:
  - Blocks requests from abusive IP addresses
  - Tracks failed login attempts
  - Implements temporary and permanent blacklisting
  - Redis-backed for persistence across application restarts

### Middleware Integration

The middleware components work together to create a comprehensive security and validation system:

1. **Request Flow**:
   - Blacklist check → Rate limiting → Authentication → Validation → Controller
   - Each step can short-circuit the request if necessary

2. **Security Layers**:
   - Network level (IP blacklisting)
   - Request level (rate limiting)
   - Authentication level (JWT validation)
   - Authorization level (role and ownership checks)
   - Input level (validation rules)

3. **Performance Considerations**:
   - Lightweight checks performed first
   - More intensive operations (like database queries) performed later
   - Redis caching for blacklist and rate limit data

## 🛑 Error Handling System

The application implements a sophisticated, multi-layered error handling system that provides consistent, user-friendly error responses while maintaining detailed logging for debugging:

### Error Class Hierarchy

The error system is built on a well-structured class hierarchy:

- **ApiError** (Base Class)
  - Extends native JavaScript Error
  - Adds HTTP status code, resource name, and error type
  - Automatically categorizes errors as "fail" (4xx) or "error" (5xx)
  - Includes stack trace capture for debugging
  - Provides factory methods for common error types

- **Specialized Error Classes**
  - **BusinessValidationError**: For business rule violations
    - Contextual error information with domain and issue type
    - Factory methods for common scenarios (forbidden, conflict, notFound, etc.)
  
  - **InputValidationError**: For request validation failures
    - Detailed field-level validation errors
    - Summary information with field counts
    - Factory methods for required fields and format errors
  
  - **JwtError**: For authentication token issues
    - Specialized types (missing, expired, invalid, blacklisted)
    - Consistent 401 status code with descriptive messages

### Error Response Formatting

The system provides consistent, user-friendly error responses:

- **Standardized Structure**
  - Status indicator ("fail" or "error")
  - User-friendly error message
  - Timestamp for when the error occurred
  - Request path for context
  - Detailed validation errors when applicable

- **Domain-Specific Messages**
  - Custom error messages for different domains (auth, books, hubs, etc.)
  - Friendly, conversational tone in error messages
  - Consistent messaging for similar error types across domains

### Centralized Error Handling

All errors flow through a centralized handler:

- **Middleware Integration**
  - Express error-handling middleware catches all errors
  - Automatic status code detection and adjustment
  - Mongoose error translation to API-friendly formats
  - Default messages for common error scenarios

- **Error Enrichment**
  - Resource name extraction from request path
  - Validation error categorization (missing fields vs. format errors)
  - Consistent error response structure regardless of error source

### Comprehensive Logging

The system includes sophisticated error logging:

- **Multi-destination Logging**
  - Console output in development with color coding
  - Rotating file logs in production
  - Different log files for errors vs. general access

- **Contextual Information**
  - HTTP request details (method, URL, status code, duration)
  - Query parameters and request body (with sensitive data redaction)
  - Error stack traces for debugging
  - Metadata enrichment for additional context

- **Log Formatting**
  - Development: Human-readable colored console output
  - Production: JSON-formatted logs for machine parsing
  - Consistent timestamp and severity level indicators

### Error Serialization

Errors are carefully serialized for logging and response:

- **Stack Trace Management**
  - Proper capture and formatting of JavaScript stack traces
  - Production/development mode awareness
  - Sensitive information filtering

- **Mongoose Error Handling**
  - Translation of validation errors to user-friendly format
  - Conversion of CastError to invalid ID messages
  - Handling of duplicate key errors

### Example Error Response

```json
{
  "status": "fail",
  "message": "Hold up! You're not cleared for this.",
  "timestamp": "2023-07-21T14:32:45.123Z",
  "path": "/api/v1/users/123"
}
```

### Validation Error Response

```json
{
  "status": "fail",
  "message": "Input validation failed.",
  "fields": {
    "email": "Email format is invalid",
    "password": "Password must be at least 6 characters"
  },
  "summary": {
    "fields": ["email", "password"],
    "count": 2
  },
  "timestamp": "2023-07-21T14:35:12.456Z",
  "path": "/api/v1/auth/register"
}
```

This sophisticated error handling system demonstrates production-grade engineering practices:

1. **User Experience**: Friendly, consistent error messages
2. **Developer Experience**: Detailed logging and debugging information
3. **Security**: Proper error information hiding in production
4. **Maintainability**: Centralized handling with consistent patterns
5. **Extensibility**: Easy to add new error types or domains

## 🔒 Security Implementation

FreeReads implements production-grade security measures to protect user data and prevent abuse:

### JWT Authentication System

The application uses a sophisticated JWT-based authentication system:

- **Dual Token Architecture**
  - Short-lived access tokens (15 minutes by default)
  - Longer-lived refresh tokens (7 days by default)
  - Separate secret keys for each token type
  - Different token payloads for different purposes

- **Token Rotation Security**
  - Refresh tokens are single-use only
  - Each refresh operation invalidates the previous token
  - New token pairs issued with unique JWT IDs (jti)
  - Creates an auditable chain of token provenance

- **Cryptographic Best Practices**
  - UUID v4 for token identifiers
  - Environment-based secret keys
  - Proper token signing and verification
  - Expiration time enforcement

### Token Blacklisting

The application implements a robust token blacklisting system:

- **Redis-Backed Blacklist**
  - Invalidated tokens stored in Redis with TTL matching token expiration
  - Automatic cleanup of expired blacklist entries
  - Prefix-based namespace isolation (`blacklist:`)
  - Fallback mechanism for when Redis is unavailable

- **Blacklist Scenarios**
  - Tokens invalidated on logout
  - Tokens invalidated on refresh
  - Tokens invalidated on password change
  - Tokens invalidated on security events (role change, etc.)

### IP-Based Protection

The application implements sophisticated IP-based protection:

- **Failed Login Tracking**
  - Counting of failed login attempts by IP address
  - Temporary lockout after exceeding threshold (default: 3 attempts)
  - Automatic reset after configurable time period
  - Redis-backed for persistence across application restarts

- **API Abuse Prevention**
  - Tracking of excessive API requests
  - Blacklisting of IPs that exceed abuse threshold
  - Configurable blacklist duration
  - Informative response messages with remaining timeout

- **Trusted IP Exemptions**
  - Configurable list of trusted IPs
  - Bypass of rate limiting for trusted IPs
  - Support for IPv4 and IPv6 addresses
  - Environment-specific configuration

### Rate Limiting

The application implements a multi-tiered rate limiting strategy:

- **Authentication-Aware Limits**
  - Stricter limits for unauthenticated requests
  - Higher limits for authenticated users
  - Highest limits for trusted IPs
  - Configurable window sizes and request counts

- **Progressive Throttling**
  - Initial rate limiting with status code 429
  - Progressive slowdown for suspicious activity
  - Configurable delay thresholds and amounts
  - Automatic release after window expiration

- **Distributed Rate Limiting**
  - Redis-backed for consistency across multiple instances
  - Graceful fallback to in-memory store when Redis is unavailable
  - Atomic increment operations for accuracy
  - TTL-based expiration for automatic cleanup

### Input Validation

The application implements thorough input validation:

- **Express-Validator Integration**
  - Custom validation rules for different entity types
  - Required field validation
  - Format validation (email, password strength, etc.)
  - Custom validators for domain-specific rules

- **Validation Middleware**
  - Centralized validation handling
  - Consistent error response format
  - Detailed field-level error messages
  - Summary information for multiple errors

- **MongoDB Schema Validation**
  - Secondary validation layer at the database level
  - Type checking and required field enforcement
  - Custom validators for complex rules
  - Pre-save hooks for derived fields

### CORS Protection

The application implements proper CORS protection:

- **Origin Restriction**
  - Configurable allowed origins
  - Environment-specific settings
  - Support for multiple origins
  - Proper handling of preflight requests

- **Method Restriction**
  - Limited to necessary HTTP methods
  - Preflight caching for performance
  - Proper handling of OPTIONS requests
  - Headers restriction

- **Credentials Support**
  - Proper handling of credentials
  - Secure cookie configuration
  - SameSite policy enforcement
  - Automatic OPTIONS response

### Security Headers

The application sets appropriate security headers:

- **Content Security Policy**
  - Restricts resource loading to trusted sources
  - Prevents XSS attacks
  - Configurable policy based on environment
  - Reporting for violations

- **XSS Protection**
  - Enables browser XSS protection
  - Blocks detected attacks
  - Prevents rendering of pages with detected XSS
  - Modern browser compatibility

- **Frame Options**
  - Prevents clickjacking attacks
  - Restricts framing to same origin
  - Configurable based on environment
  - Browser compatibility considerations

- **HSTS**
  - Enforces HTTPS usage
  - Configurable max-age
  - Includes subdomains
  - Preload support

This comprehensive security implementation demonstrates production-grade security engineering practices that protect user data, prevent abuse, and maintain system integrity.

## 🤖 AI Integration & Computer Vision

FreeReads leverages Google Cloud Vision API to provide intelligent book scanning capabilities:

### Google Cloud Integration

- **Service Account Authentication**
  - Secure authentication using Google service account credentials
  - Environment-based configuration
  - Support for both file-based and environment variable-based credentials
  - Proper error handling for authentication failures

- **Vision API Client**
  - Efficient client initialization
  - Request batching for performance
  - Proper error handling and retries
  - Resource cleanup after use

### ISBN Detection

- **Text Detection and Analysis**
  - Extracts text from book cover images
  - Analyzes text for ISBN patterns
  - Supports multiple ISBN formats (ISBN-10, ISBN-13)
  - Fallback mechanisms for different text orientations

- **Image Processing**
  - Supports various image formats (JPEG, PNG, etc.)
  - Handles different image resolutions
  - Processes images from URLs
  - Optimizes image data for API requests

### Book Metadata Lookup

- **ISBN-based Lookup**
  - Uses detected ISBN to query book metadata
  - Integration with Google Books API
  - Fallback to other book metadata sources
  - Comprehensive error handling for not-found scenarios

- **Data Normalization**
  - Standardizes book metadata from different sources
  - Extracts relevant information (title, author, genre, etc.)
  - Handles inconsistent data formats
  - Provides consistent response structure

### Scanning API

- **Flexible Input Options**
  - Direct ISBN input
  - Image URL for scanning
  - Support for both approaches in a single endpoint
  - Validation for both input types

- **Error Handling**
  - Graceful handling of unrecognized ISBNs
  - Informative error messages for scanning failures
  - Fallback strategies for partial information
  - Proper HTTP status codes for different error scenarios

### Future AI Enhancements

As outlined in the project roadmap, future enhancements will include:

- **Custom Computer Vision Models**
  - Book cover recognition without ISBN
  - Condition assessment from book images
  - Genre classification from cover design
  - Multi-book detection in a single image

- **Natural Language Processing**
  - Book description analysis
  - Automated genre classification
  - Sentiment analysis for book themes
  - Text summarization

This AI integration showcases both practical implementation skills with current cloud services and a forward-thinking approach to developing custom AI solutions tailored to the specific needs of a book-sharing platform.

## ⚡ Performance Engineering

FreeReads implements sophisticated performance optimization techniques across all layers of the application:

### Caching Architecture

- **Multi-Tiered Redis Implementation**
  - Token blacklist caching with TTL-based expiration
  - Rate limiting data with atomic operations
  - Future expansion for book and hub data caching
  - Namespace isolation with prefixes

- **Intelligent Reconnection Strategy**
  - Exponential backoff for Redis reconnection attempts
  - Maximum delay cap to prevent excessive waiting
  - Event-based reconnection handling
  - Graceful degradation during connection issues

- **Cache Invalidation Strategies**
  - Time-based expiration for temporary data
  - Manual invalidation for user-triggered changes
  - Selective invalidation to minimize cache churn
  - Consistent hashing for distributed caching

### Database Optimization

- **Strategic MongoDB Indexing**
  - Geospatial indexing for location-based queries
  - Compound indexes for common query patterns
  - Text indexes for search functionality
  - Index analysis and optimization

- **Query Optimization**
  - Projection to limit returned fields
  - Lean queries to reduce object overhead
  - Pagination for large result sets
  - Aggregation pipeline optimization

- **Connection Management**
  - Connection pooling for efficient resource usage
  - Proper connection error handling
  - Reconnection strategies
  - Query timeout handling

- **Document Structure Optimization**
  - Strategic denormalization for query performance
  - Embedded documents for related data
  - Reference optimization for large collections
  - Schema design for common access patterns

### Request Processing Optimization

- **Middleware Sequencing**
  - Lightweight checks performed first
  - Early termination for invalid requests
  - Authentication before authorization
  - Validation before business logic

- **Parallel Processing**
  - Concurrent external API calls
  - Promise.all for independent operations
  - Proper error handling for parallel operations
  - Resource management for concurrent requests

- **Response Optimization**
  - Appropriate HTTP status codes
  - Consistent response structure
  - Pagination for large result sets
  - Selective field inclusion/exclusion

### Memory Management

- **Resource Cleanup**
  - Proper closure of database connections
  - Redis client cleanup
  - External API client disposal
  - Garbage collection optimization

- **Buffer Management**
  - Efficient handling of binary data
  - Stream processing for large files
  - Memory usage monitoring
  - Leak prevention strategies

### Performance Monitoring

- **Request Timing**
  - Duration tracking for all requests
  - Slow query identification
  - Performance threshold alerts
  - Timing breakdown by middleware and controller

- **Resource Usage Tracking**
  - Memory consumption monitoring
  - CPU utilization tracking
  - Connection pool statistics
  - Cache hit/miss ratios

These performance engineering practices ensure that FreeReads delivers responsive, efficient service even under high load conditions, demonstrating production-grade optimization techniques.

## 🚀 Scalability Considerations

FreeReads is designed from the ground up with horizontal scalability in mind:

### Stateless Architecture

- **Containerized Application Design**
  - Docker-based deployment enables consistent environments
  - Each container is independent and disposable
  - No local state storage in application containers
  - Easy replication across multiple instances

- **JWT-Based Authentication**
  - No server-side session storage required
  - Authentication state carried in tokens
  - Enables request routing to any available server
  - No sticky sessions needed for user persistence

### Distributed Data Management

- **Redis for Shared State**
  - Centralized token blacklist accessible from all instances
  - Distributed rate limiting with atomic operations
  - Shared caching layer for performance optimization
  - Connection pooling for efficient resource utilization

- **MongoDB Scalability**
  - Horizontal scaling through sharding
  - Read replicas for distributing query load
  - Indexed collections for efficient queries at scale
  - Optimized document structure for high-volume operations

### Load Distribution

- **NGINX as Reverse Proxy**
  - Load balancing across multiple application instances
  - Health checks to route traffic only to healthy instances
  - SSL termination to offload encryption overhead
  - Static content caching to reduce application load

- **Microservices-Ready Design**
  - Clear separation of concerns between components
  - Service-oriented architecture for independent scaling
  - Well-defined API contracts between services
  - Future-ready for breaking out high-load components

### Cloud-Native Deployment

- **Render Platform Integration**
  - Auto-scaling based on traffic patterns
  - Geographic distribution capabilities
  - Resource allocation optimization
  - Zero-downtime deployments

- **Infrastructure as Code**
  - Deployment configuration in version control
  - Environment-specific settings
  - Reproducible infrastructure setup
  - Automated scaling policies

These scalability considerations ensure that FreeReads can handle growing user loads by adding more instances horizontally rather than scaling vertically, providing cost-effective performance as demand increases.

## 🧪 Code Quality & Testing

FreeReads implements industry-standard code quality practices to ensure maintainability, reliability, and developer productivity:

### Comprehensive Testing Strategy

- **Unit Testing with Jest**
  - Component-level tests for services and utilities
  - Mocking of external dependencies
  - Test coverage reporting with minimum 80% threshold
  - Snapshot testing for response structures

- **Integration Testing**
  - API endpoint testing with supertest
  - Database operation validation
  - Authentication flow verification
  - Error handling validation

- **End-to-End Testing**
  - Complete user journey testing
  - Cross-service integration validation
  - Performance benchmarking
  - Regression testing suite

### Static Analysis & Linting

- **ESLint Configuration**
  - Airbnb style guide enforcement
  - Custom rules for project-specific patterns
  - Integration with editor tools
  - Automatic fixing of common issues

- **Prettier Code Formatting**
  - Consistent code style across the codebase
  - Editor integration for format-on-save
  - Custom configuration aligned with team preferences
  - Pre-commit hooks for automatic formatting

- **TypeScript Migration (In Progress)**
  - Gradual adoption of static typing
  - Interface definitions for core data structures
  - Type-safe API contracts
  - Enhanced IDE support and code completion

### Continuous Integration

- **GitHub Actions Workflow**
  - Automated testing on pull requests
  - Code quality checks before merge
  - Test coverage reporting
  - Security vulnerability scanning

- **Pre-commit Hooks**
  - Lint-staged for targeted linting
  - Commit message validation
  - Prohibited pattern detection
  - Test execution for affected files

### Code Review Process

- **Pull Request Templates**
  - Structured format for change description
  - Testing verification checklist
  - Documentation requirements
  - Performance impact assessment

- **Code Review Guidelines**
  - Focus areas for different types of changes
  - Security review for authentication changes
  - Performance review for database operations
  - Accessibility review for user-facing features

### Documentation Standards

- **JSDoc Comments**
  - Function and class documentation
  - Parameter and return type documentation
  - Example usage where appropriate
  - Link to related components

- **Architecture Decision Records**
  - Documentation of key technical decisions
  - Alternatives considered
  - Trade-off analysis
  - Implementation guidelines

These code quality practices ensure that FreeReads maintains a high standard of code maintainability and reliability, making it easier to onboard new developers and implement new features with confidence.

## 📚 API Documentation

The API is fully documented using Swagger/OpenAPI. When running the application, the root path (`/`) serves an interactive Swagger documentation interface with custom styling and organization by tags.

![FreeReads API Documentation](https://res.cloudinary.com/dhlhrakma/image/upload/w_1000,ar_16:9,c_fill,g_auto,e_sharpen/v1744055268/freereads/readme/freereads_swagger_sj7c74.png)

### Interactive Documentation Features

- **Try It Out**: Test API endpoints directly from the browser
- **Request Builder**: Automatically formatted request bodies
- **Authentication Support**: Test secured endpoints with JWT
- **Schema Visualization**: Complete data models and relationships
- **Response Examples**: Sample responses for all endpoints
- **Error Documentation**: Comprehensive error scenarios and codes

### Accessing the Documentation

- **Development**: Available at `http://localhost:5500/` when running locally
- **Production**: Available at `https://freereads-lof1.onrender.com/`

The documentation is automatically generated from code annotations, ensuring it always stays in sync with the actual implementation.

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/v1/auth/register` | Register a new user | Public |
| POST | `/api/v1/auth/login` | Authenticate a user | Public |
| POST | `/api/v1/auth/logout` | Invalidate refresh token | Authenticated |
| POST | `/api/v1/auth/refresh` | Refresh access token | Authenticated |

#### Authentication Flow
1. Register or login to receive access and refresh tokens
2. Use access token for API requests (valid for limited time)
3. Use refresh token to obtain new access token when expired
4. Tokens are automatically blacklisted on logout

### Book Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/books` | Get all books | Public |
| GET | `/api/v1/books/:id` | Get book details | Public |
| PUT | `/api/v1/books` | Update or insert book | Authenticated |
| DELETE | `/api/v1/hubs/:id` | Delete a hub | Overlord |

### User Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/users` | Get all users | Boss, Overlord |
| GET | `/api/v1/users/:id` | Get user details | Self, Boss, Overlord |
| POST | `/api/v1/users` | Create a new user | Boss, Overlord |
| PUT | `/api/v1/users/:id` | Update a user | Self, Boss, Overlord |
| DELETE | `/api/v1/users/:id` | Delete a user | Self, Overlord |

### Book Scanning

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/v1/scan` | Scan a book by ISBN or image | Authenticated |

#### Scanning Features
- Direct ISBN input processing
- Image-based ISBN detection using Google Cloud Vision
- Automatic book metadata lookup
- Error handling for unrecognized books

## 🛠 Setup and Installation

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB (local or Atlas)
- Redis (optional for development)
- Google Cloud account with Vision API enabled

### Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/mistersouza/freereads.git
cd freereads/WD-BE
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.development.local
# Edit the file with your configuration
```

4. Set up Google Cloud credentials:
   - Create a service account in Google Cloud Console
   - Download the credentials JSON file
   - Place it at `src/config/google-credentials.json` or use the GOOGLE_CREDENTIALS_BASE64 environment variable

5. Start the development server:
```bash
npm run dev
```

### Environment Variables

The application requires several environment variables for configuration:

```
# Environment
NODE_ENV=development

# Server
PORT=5500

# Live site
LIVE_SITE=https://freereads-reverse-proxy.onrender.com

# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority&appName=<AppName>

# Google Cloud
GOOGLE_CREDENTIALS=./src/config/google-credentials.json
GOOGLE_CREDENTIALS_BASE64=<base64-encoded-credentials>

# CORS
CORS_ORIGIN=https://your-frontend-domain.com,http://localhost:3000

# Authentication
JWT_ACCESS_SECRET=your-access-token-secret
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_ACCESS_EXPIRES_IN=900
JWT_REFRESH_EXPIRES_IN=604800

# Rate limiting
TRUSTED_IPS=::1,127.0.0.1
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_STRICT=10
RATE_LIMIT_DEFAULT=100
RATE_LIMIT_AUTHENTICATED=150

# Speed limiting
SLOW_DOWN_WINDOW_MS=900000
SLOW_DOWN_DELAY_AFTER=60
SLOW_DOWN_DELAY_MS=1000

# Blacklist
BLACKLIST_PREFIX=blacklist
BLACKLIST_DURATION=86400
MAX_LOGIN_ATTEMPTS=3
MAX_API_ABUSE=1000
ATTEMPT_RESET_TIME=3600

# Redis
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=true
```

## 💻 Development Guide

### Project Structure

```
WD-BE/
├── src/
│   ├── config/        # Configuration files
│   │   ├── cors.js    # CORS configuration
│   │   ├── env.js     # Environment variables
│   │   ├── swagger.js # API documentation
│   │   └── google-credentials.json # Google Cloud credentials
│   ├── controllers/   # Request handlers
│   │   ├── auth-controller.js   # Authentication logic
│   │   ├── book-controller.js   # Book management
│   │   ├── hub-controller.js    # Hub management
│   │   ├── scan-controller.js   # Book scanning
│   │   └── user-controller.js   # User management
│   ├── middlewares/   # Express middleware
│   │   ├── auth-middleware.js      # Authentication
│   │   ├── validate-middleware.js  # Input validation
│   │   ├── limit-middleware.js     # Rate limiting
│   │   └── blacklist-middleware.js # IP blacklisting
│   ├── models/        # Mongoose data models
│   │   ├── user-model.js   # User schema
│   │   ├── book-model.js   # Book schema
│   │   └── hub-model.js    # Hub schema with geolocation
│   ├── routes/        # API route definitions
│   │   ├── auth-router.js   # Authentication routes
│   │   ├── book-router.js   # Book management routes
│   │   ├── hub-router.js    # Hub management routes
│   │   ├── scan-router.js   # Book scanning routes
│   │   └── user-router.js   # User management routes
│   ├── services/      # Business logic
│   │   ├── error/     # Error handling
│   │   │   ├── classes/   # Custom error classes
│   │   │   ├── constants.js # Error messages
│   │   │   ├── handler.js   # Error middleware
│   │   │   ├── logger.js    # Logging utilities
│   │   │   └── utils.js     # Error utilities
│   │   ├── blacklist/  # Token and IP blacklisting
│   │   ├── book/       # Book-related services
│   │   ├── hub/        # Hub management services
│   │   ├── jwt/        # Token management
│   │   ├── request-control/ # Rate limiting
│   │   └── user/       # User management
│   ├── infrastructure/ # Database and external services
│   │   ├── database/   # MongoDB connection
│   │   └── redis/      # Redis connection and store
│   ├── init/          # Initialization services
│   │   ├── index.js    # Bootstrap orchestration
│   │   └── services.js # Service initialization
│   └── server.js      # Application entry point
├── tests/             # Test files
│   ├── unit/          # Unit tests
│   ├── integration/   # Integration tests
│   └── fixtures/      # Test data
└── package.json       # Project dependencies
```

### Key Implementation Details

1. **Authentication**
   - JWT-based authentication with separate access and refresh tokens
   - Token blacklisting for logout security
   - Role-based access control for protected routes
   - Secure password hashing with bcrypt

2. **Book Management**
   - CRUD operations for books
   - Automatic availability status based on copies count
   - ISBN-based book lookup and scanning
   - Integration with Google Cloud Vision for image processing

3. **Hub Management**
   - Geospatial queries for location-based searches
   - Automatic geocoding of addresses using OpenStreetMap
   - Book inventory tracking
   - Role-based access control for hub operations

4. **Error Handling**
   - Centralized error handling middleware
   - Custom error classes for different error types
   - Consistent error response format
   - Detailed logging with appropriate severity levels

5. **Security**
   - Rate limiting with different tiers based on authentication status
   - Progressive request slowdown
   - IP blacklisting for abuse prevention
   - Input validation and sanitization
   - Token rotation and blacklisting

6. **Performance**
   - Redis caching for token blacklisting and rate limiting
   - MongoDB indexing for efficient queries
   - Middleware sequencing for optimal request processing
   - Connection pooling for database and Redis

7. **Documentation**
   - Interactive Swagger UI with custom styling
   - Comprehensive API documentation
   - JSDoc comments for code documentation
   - Environment-specific server URLs

## 🧪 Testing

The project uses Jest for testing with a comprehensive testing strategy:

### Test Types

- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test interactions between components
- **API Tests**: Test API endpoints with supertest
- **End-to-End Tests**: Test complete user flows

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- tests/unit/services/jwt.test.js

# Run tests in watch mode
npm test -- --watch
```

### Test Structure

Tests are organized to mirror the project structure:

```
tests/
├── unit/
│   ├── services/
│   │   ├── jwt.test.js
│   │   ├── blacklist.test.js
│   │   └── ...
│   ├── middlewares/
│   │   ├── auth-middleware.test.js
│   │   └── ...
│   └── ...
├── integration/
│   ├── auth.test.js
│   ├── books.test.js
│   └── ...
└── fixtures/
    ├── users.js
    ├── books.js
    └── ...
```

### Test Best Practices

- **Isolation**: Each test runs in isolation with its own database state
- **Mocking**: External services are mocked for unit tests
- **Coverage**: Aim for 80%+ code coverage
- **Fixtures**: Reusable test data for consistent testing
- **Cleanup**: Tests clean up after themselves

## 🚀 Deployment

The application is deployed on Render's cloud platform using Docker containers and a CI/CD pipeline:

### CI/CD Pipeline

GitHub Actions workflow automates:
- Running tests on pull requests
- Building Docker images
- Deploying to Render on successful merges to main

### Production Configuration

- MongoDB Atlas for database
- Upstash Redis for caching and token blacklisting
- Render for hosting
- Environment variables managed through Render dashboard
- Google Cloud credentials stored as base64-encoded environment variables

### Deployment Process

1. Code is pushed to the main branch
2. GitHub Actions runs tests and builds the application
3. On successful build, Render automatically deploys the new version
4. Environment-specific configuration is applied during deployment

### Infrastructure as Code

The deployment configuration is defined in code:

- `render.yaml` for Render configuration
- `Dockerfile` for container definition
- `.github/workflows/ci-cd.yml` for CI/CD pipeline
- Environment variable templates in `.env.example`

### Monitoring and Logging

- Application logs streamed to Render dashboard
- Error tracking with detailed error information
- Performance monitoring with request timing
- Health check endpoints for monitoring

This comprehensive deployment setup demonstrates production-grade DevOps practices that ensure reliable, consistent deployments with minimal downtime.

## Conclusion

FreeReads Berlin API demonstrates professional-grade backend development with a focus on security, performance, and scalability. The architecture follows industry best practices for modern web applications, making it both robust for current needs and flexible for future expansion.

The implementation showcases a wide range of technical skills including:

- Advanced authentication and authorization
- Sophisticated error handling
- Performance optimization
- Cloud service integration
- Geospatial data processing
- Comprehensive testing
- Production-ready deployment

This project serves as both a functional community service and a demonstration of production-quality backend development capabilities.