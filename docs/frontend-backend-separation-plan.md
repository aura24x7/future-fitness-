# Frontend-Backend Separation Plan

## Phase 1: Initial Setup & Planning

### 1.1 Repository Setup
- [ ] Create new backend repository
- [ ] Set up backend project structure following FastAPI best practices
- [ ] Configure development environment with Poetry for dependency management
- [ ] Set up CI/CD pipelines with GitHub Actions
- [ ] Configure pre-commit hooks for code quality

### 1.2 Technology Stack Selection
#### Backend Stack:
- FastAPI (Python web framework)
  - Async support for high performance
  - Built-in OpenAPI documentation
  - Type safety with Pydantic
  - Middleware support for CORS, authentication, etc.

- PostgreSQL (primary database)
  - JSON support for flexible data storage
  - Full-text search capabilities
  - Robust indexing for performance
  - Transaction support for data integrity

- Redis (caching & real-time features)
  - LRU caching implementation
  - Session management
  - Rate limiting
  - Real-time updates

- Additional Components:
  - Pydantic for data validation
  - JWT for authentication
  - Docker for containerization
  - Google AI SDK for Gemini integration
  - Alembic for database migrations
  - Celery for background tasks

#### Frontend Updates:
- API Integration:
  - Create unified API client
  - Implement request interceptors
  - Add response transformers
  - Add retry logic

- Configuration:
  - Update environment variables
  - Add API endpoint configuration
  - Configure development proxies
  - Update build pipeline

- State Management:
  - Update context providers
  - Implement optimistic updates
  - Add offline support
  - Enhance error handling

## Phase 2: Data Migration Planning

### 2.1 Database Schema Design
Based on current data structures:

1. User Schema:
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    display_name VARCHAR(255),
    birthday DATE,
    gender VARCHAR(50),
    height JSONB,  -- {value: number, unit: string}
    weight JSONB,  -- {value: number, unit: string}
    target_weight JSONB,
    fitness_goal TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

2. Food Log Schema:
```sql
CREATE TABLE food_logs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    calories INTEGER NOT NULL,
    protein DECIMAL,
    carbs DECIMAL,
    fat DECIMAL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    image_url TEXT,
    ai_analysis JSONB,
    metadata JSONB
);
```

3. Workout Schema:
```sql
CREATE TABLE workouts (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    duration INTEGER,
    calories_burned INTEGER,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    exercises JSONB[]
);
```

### 2.2 Firebase to PostgreSQL Migration
Migration Strategy:
1. Data Export:
   - Export Firestore collections to JSON
   - Validate data integrity
   - Transform data structure

2. Data Import:
   - Create PostgreSQL schemas
   - Transform JSON to SQL
   - Validate foreign keys
   - Create indexes

3. Verification:
   - Compare record counts
   - Validate data integrity
   - Check relationships
   - Verify constraints

### 2.3 Data Integrity Verification
Verification Process:
1. Data Validation:
   ```typescript
   interface ValidationResult {
     totalRecords: number;
     validRecords: number;
     invalidRecords: number;
     errors: ValidationError[];
   }
   ```

2. Consistency Checks:
   - Foreign key integrity
   - Data type validation
   - Required field checks
   - Business rule validation

3. Error Recovery:
   - Error categorization
   - Recovery procedures
   - Manual intervention process
   - Data cleanup scripts

## Phase 3: API Development

### 3.1 Authentication API
Current Implementation:
```typescript
interface AuthService {
    signIn(email: string, password: string): Promise<UserCredential>;
    signUp(email: string, password: string): Promise<UserCredential>;
    signOut(): Promise<void>;
    resetPassword(email: string): Promise<void>;
    getCurrentUser(): Promise<User | null>;
}
```

New Backend Endpoints:
```typescript
// Authentication
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/reset-password
GET  /api/v1/auth/me

// Response Types
interface AuthResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    user: UserProfile;
}
```

### 3.2 User Management API
Current Implementation:
```typescript
interface UserProfile {
    uid: string;
    email: string;
    name: string;
    displayName: string;
    birthday?: Date;
    gender?: string;
    height?: { value: number; unit: string };
    weight?: { value: number; unit: string };
    targetWeight?: { value: number; unit: string };
    fitnessGoal?: string;
}
```

New Backend Endpoints:
```typescript
// User Management
GET    /api/v1/users/profile
PUT    /api/v1/users/profile
PATCH  /api/v1/users/settings
GET    /api/v1/users/stats
POST   /api/v1/users/preferences

// Response Types
interface UserResponse {
    profile: UserProfile;
    settings: UserSettings;
    stats: UserStats;
    preferences: UserPreferences;
}
```

### 3.3 Food Logging API
Current Implementation:
```typescript
interface SimpleFoodItem {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    timestamp: string;
}
```

New Backend Endpoints:
```typescript
// Food Logging
POST   /api/v1/food/logs
GET    /api/v1/food/logs
GET    /api/v1/food/logs/:id
PUT    /api/v1/food/logs/:id
DELETE /api/v1/food/logs/:id
POST   /api/v1/food/analyze
GET    /api/v1/food/stats

// Batch Operations
POST   /api/v1/food/logs/batch
DELETE /api/v1/food/logs/batch

// Response Types
interface FoodLogResponse {
    items: SimpleFoodItem[];
    total: number;
    page: number;
    hasMore: boolean;
}
```

## Phase 4: AI Service Migration

### 4.1 Gemini AI Integration
Current Configuration:
```typescript
const GEMINI_MODELS = {
    VISION: 'gemini-1.5-flash',
    TEXT: 'gemini-1.5-flash',
    FAST: 'gemini-1.5-flash'
}

const GENERATION_CONFIG = {
    temperature: 0.2,
    topK: 32,
    topP: 0.7,
    maxOutputTokens: 2048
}
```

Backend Implementation:
1. AI Service Setup:
   - Move API keys to backend
   - Implement request queuing
   - Add rate limiting
   - Configure caching

2. Request Handling:
   - Validate input
   - Process images
   - Handle timeouts
   - Implement retries

3. Response Processing:
   - Format responses
   - Handle errors
   - Cache results
   - Track usage

### 4.2 Image Processing
Image Service:
```typescript
interface ImageProcessingConfig {
    maxSize: number;        // 4MB
    formats: string[];      // ['image/jpeg', 'image/png']
    quality: number;        // 80
    compression: boolean;   // true
}

interface ImageService {
    upload(file: File): Promise<string>;
    process(url: string, options: ProcessingOptions): Promise<string>;
    analyze(url: string): Promise<AnalysisResult>;
}
```

Storage Solution:
1. Object Storage:
   - S3 or equivalent
   - CDN integration
   - Cache control
   - Access policies

2. Processing Pipeline:
   - Image optimization
   - Format conversion
   - Size validation
   - Metadata extraction

### 4.3 AI Response Handling
Error Handling:
```typescript
const ERROR_MESSAGES = {
    API_DISABLED: 'Gemini API is not enabled',
    INVALID_KEY: 'Invalid API key',
    NETWORK_ERROR: 'Network error occurred',
    TIMEOUT: 'Request timed out',
    GENERATION_ERROR: 'Error generating response'
}
```

Retry Strategy:
```typescript
interface RetryConfig {
    maxAttempts: number;    // 3
    backoffMs: number;      // 1000
    maxBackoffMs: number;   // 10000
    timeoutMs: number;      // 30000
}
```

## Phase 5: Frontend Refactoring

### 5.1 Service Layer Updates
New API Client:
```typescript
class ApiClient {
    constructor(baseUrl: string, options: ApiOptions) {
        this.baseUrl = baseUrl;
        this.options = options;
    }

    setAuthToken(token: string): void {
        this.token = token;
    }

    async request<T>(endpoint: string, options: RequestOptions): Promise<T> {
        try {
            // Request implementation
        } catch (error) {
            // Error handling
        }
    }

    // Typed methods
    get<T>(endpoint: string): Promise<T>;
    post<T>(endpoint: string, data: any): Promise<T>;
    put<T>(endpoint: string, data: any): Promise<T>;
    delete(endpoint: string): Promise<void>;
}
```

### 5.2 Authentication Updates
JWT Implementation:
```typescript
interface JWTConfig {
    accessTokenKey: string;
    refreshTokenKey: string;
    tokenType: string;
}

class AuthManager {
    constructor(storage: Storage, config: JWTConfig) {
        this.storage = storage;
        this.config = config;
    }

    async getAccessToken(): Promise<string | null>;
    async setTokens(access: string, refresh: string): Promise<void>;
    async refreshTokens(): Promise<void>;
    async clearTokens(): Promise<void>;
}
```

### 5.3 State Management Updates
Context Updates:
```typescript
interface StateConfig {
    optimisticUpdates: boolean;
    offlineSupport: boolean;
    syncInterval: number;
}

function createStateProvider<T>(config: StateConfig) {
    return function Provider({ children }: PropsWithChildren) {
        // Provider implementation
    };
}
```

## Phase 6: Testing Strategy

### 6.1 Backend Testing
1. Unit Tests:
   - Service layer tests
   - Model validation
   - Utility functions
   - Error handling

2. Integration Tests:
   - API endpoints
   - Database operations
   - Cache interactions
   - External services

3. Performance Tests:
   - Load testing
   - Stress testing
   - Endurance testing
   - Spike testing

### 6.2 Frontend Testing
1. Unit Tests:
   - Component tests
   - Hook tests
   - Utility tests
   - State management

2. Integration Tests:
   - API integration
   - Navigation flow
   - State updates
   - Error handling

3. E2E Tests:
   - User flows
   - Critical paths
   - Error scenarios
   - Performance

### 6.3 Migration Testing
1. Data Migration:
   - Schema validation
   - Data integrity
   - Performance impact
   - Rollback testing

2. API Compatibility:
   - Request/response validation
   - Error handling
   - Performance comparison
   - Security testing

## Phase 7: Deployment Strategy

### 7.1 Backend Deployment
1. Environment Setup:
   - Development
   - Staging
   - Production
   - Testing

2. Infrastructure:
   - Container orchestration
   - Load balancing
   - Auto-scaling
   - Monitoring

3. Configuration:
   - Environment variables
   - Secrets management
   - Logging setup
   - Backup strategy

### 7.2 Frontend Updates
1. Build Process:
   - Environment configs
   - Asset optimization
   - Code splitting
   - Cache strategy

2. Deployment Pipeline:
   - Build automation
   - Testing integration
   - Version management
   - Release process

## Phase 8: Migration Execution

### 8.1 Staged Migration
1. Infrastructure Deployment:
   - Set up backend services
   - Configure databases
   - Set up caching
   - Configure monitoring

2. Feature Migration:
   - Authentication system
   - User management
   - Food logging
   - AI services

3. Data Migration:
   - Export existing data
   - Transform data
   - Import to new system
   - Verify integrity

### 8.2 Rollback Plan
1. Triggers:
   - Data inconsistency
   - Performance degradation
   - Critical errors
   - Security issues

2. Procedures:
   - Stop migration
   - Restore data
   - Revert code
   - Notify users

## Phase 9: Post-Migration

### 9.1 Monitoring
1. Performance Metrics:
   - Response times
   - Error rates
   - Resource usage
   - User metrics

2. Error Tracking:
   - Error logging
   - Alert system
   - Issue tracking
   - Resolution time

### 9.2 Documentation
1. API Documentation:
   - Endpoint documentation
   - Request/response examples
   - Error codes
   - Rate limits

2. System Documentation:
   - Architecture overview
   - Setup guides
   - Troubleshooting
   - Best practices

## Risk Management

### Critical Risks
1. Data Migration:
   - Data loss
   - Corruption
   - Performance impact
   - Inconsistency

2. Service Disruption:
   - API availability
   - Performance degradation
   - User experience
   - Data sync issues

3. Security:
   - Authentication issues
   - Data exposure
   - API vulnerabilities
   - Token management

### Mitigation Strategies
1. Data Protection:
   - Regular backups
   - Validation checks
   - Rollback procedures
   - Monitoring

2. Service Continuity:
   - Staged rollout
   - Feature flags
   - Performance monitoring
   - User communication

3. Security Measures:
   - Security audits
   - Penetration testing
   - Access control
   - Encryption

## Timeline and Milestones

### Phase Durations
- Planning & Setup: 1 week
- Database Migration: 2 weeks
- API Development: 2 weeks
- Frontend Updates: 2 weeks
- Testing: 1 week
- Migration: 1 week
- Stabilization: 1 week

### Key Milestones
1. Backend Infrastructure:
   - Repository setup
   - Database setup
   - API framework
   - CI/CD pipeline

2. API Development:
   - Authentication
   - User management
   - Food logging
   - AI services

3. Frontend Updates:
   - API integration
   - State management
   - Error handling
   - Offline support

4. Testing & Deployment:
   - Test automation
   - Performance testing
   - Security testing
   - Production deployment