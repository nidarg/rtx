
# 🚀 RTX Device Manager — Backend (NestJS + MySQL + Docker)

## 📘 Overview

**RTX Device Manager** is a backend application built with **NestJS** and **TypeORM**, designed to manage users and IoT devices (real or simulated).  
It provides a **modular**, **scalable architecture** and runs entirely in containers using **Docker Compose**, making it ideal for both development and production-ready deployment.

---

## 🧩 Tech Stack

| Component | Technology | Purpose |
|------------|-------------|----------|
| **Backend Framework** | NestJS (TypeScript) | Modular, scalable API architecture |
| **ORM** | TypeORM | Object-relational mapping (Entities ↔ MySQL tables) |
| **Database** | MySQL 8 | Persistent storage for users and devices |
| **Validation** | class-validator, class-transformer | Input validation for DTOs |
| **Password Hashing** | bcrypt | Secure password encryption |
| **Containerization** | Docker & Docker Compose | Reproducible local and production environments |
| **DB Admin UI** | Adminer | Web UI to inspect and manage the MySQL database |

---

## ⚙️ Project Structure

/rtx-device-manager
/backend
src/
/users
user.entity.ts
users.module.ts
users.service.ts
users.controller.ts
dto/create-user.dto.ts
/devices
device.entity.ts
devices.module.ts
app.module.ts
main.ts
Dockerfile
ormconfig.ts
package.json
docker-compose.yml
README.md

yaml
Copy code

---

## 🧱 Implemented Features

### ✅ Users Module

- **Entity:** `User` — database schema for the users table  
- **DTO:** `CreateUserDto` — validates incoming request data (`username`, `password`, `role`)

**Service:**
- Create new users (`createUser`)
- Hash passwords with `bcrypt.hash()`
- Check for duplicate usernames

**Controller:**
- `POST /users` → create a new user  
- `GET /users` → list all users (excluding passwords)

---

### ✅ Devices Module

- **Entity:** `Device` — database schema for devices table  
- **DTO:** `CreateDeviceDto` — validates device creation requests  
- **Controller/Service:** To be implemented next

---

## 🧩 TypeORM Configuration

**File:** `ormconfig.ts`

```ts
import { DataSourceOptions } from 'typeorm';
import { Device } from './devices/device.entity';
import { User } from './users/user.entity';

const config: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'db',
  port: +(process.env.DB_PORT || 3306),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'rootpwd',
  database: process.env.DB_NAME || 'rtx',
  entities: [Device, User],
  synchronize: true, // only for dev (auto-creates tables)
  logging: false,
};

export default config;
⚠️ Note: synchronize: true should only be used in development.
For production, use migrations to avoid accidental data loss.

🐳 Docker Configuration
🧾 Backend Dockerfile
dockerfile
Copy code
# === Build stage ===
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# === Runtime stage ===
FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
RUN npm install --production
EXPOSE 3000
CMD ["node", "dist/main.js"]
✅ Dev tip: For hot reload in development, you can mount the source code and run
npm run start:dev instead of using the runtime image.

🧾 docker-compose.yml
yaml
Copy code
version: "3.9"

services:
  backend:
    build: ./backend
    container_name: rtx-backend
    ports:
      - "3000:3000"
    environment:
      DB_HOST: db
      DB_PORT: 3306
      DB_USER: root
      DB_PASS: rootpwd
      DB_NAME: rtx
    depends_on:
      - db
    volumes:
      - ./backend:/app        # mount code for development
      - /app/node_modules     # keep installed node_modules
    command: ["npm", "run", "start:dev"]  # hot reload

  db:
    image: mysql:8
    container_name: rtx-db
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: rootpwd
      MYSQL_DATABASE: rtx
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  adminer:
    image: adminer
    container_name: rtx-adminer
    restart: always
    ports:
      - "8080:8080"

volumes:
  db_data:
⚠️ Production Tip:
Remove source code volumes and switch command to:
["node", "dist/main.js"]

🔥 Running the Project
Start all containers:

bash
Copy code
docker-compose up --build
Verify running services:

bash
Copy code
docker ps
You should see:

rtx-backend (NestJS app)

rtx-db (MySQL)

rtx-adminer (Adminer UI)

🧪 Test API with Postman
POST /users

URL:

bash
Copy code
http://localhost:3000/users
Body:

json
Copy code
{
  "username": "testuser",
  "password": "Password123!",
  "role": "admin"
}
Response:

json
Copy code
{
  "id": 1,
  "username": "testuser",
  "role": "admin",
  "createdAt": "2025-10-25T12:00:00.000Z"
}
🗄️ Check the Database
Open Adminer:
👉 http://localhost:8080

Login:

System: MySQL

Server: db

Username: root

Password: rootpwd

Database: rtx

🔒 Environment Variables
In development: defined in docker-compose.yml
In production: should be stored securely in AWS Secrets Manager or SSM Parameter Store

🧠 Next Steps
Implement authentication & authorization (JWT + roles)

Implement DevicesService and controller

Connect real/simulated IoT devices via MQTT

Add frontend (React + Mantine) and connect to backend API

🔑 Authentication Flow (JWT, NestJS)
📘 Overview
The backend implements JWT-based authentication with access tokens, using NestJS, Passport, and TypeORM.

Flow:

Users send credentials (username/password) to POST /auth/login.

Backend validates credentials.

Backend returns a signed JWT access token.

Client uses this token in subsequent requests (Authorization: Bearer <token>).

NestJS automatically validates the token via JwtStrategy, populates request.user, and guards can use it.

🧩 Components
1️⃣ DTOs
LoginUserDto

Validates the request payload for login.

ts
Copy code
export class LoginUserDto {
  username: string;
  password: string;
}
UserResponseDto

Defines the shape of a user object returned by services (without password).

ts
Copy code
export class UserResponseDto {
  id: number;
  username: string;
  role: 'admin' | 'operator';
}
JwtPayload

Defines the payload included in the JWT.

ts
Copy code
export interface JwtPayload {
  sub: number;       // user ID
  username: string;  // username
  role: 'admin' | 'operator';
}
2️⃣ AuthController (src/auth/auth.controller.ts)
Exposes endpoints for authentication.

ts
Copy code
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const user = await this.authService.validateUser(loginUserDto);
    return this.authService.login(user); // returns { access_token: '...' }
  }
}

## 🔐 Authentication & Authorization (JWT Flow)

### 🔄 Flow Explained

1. Receives **POST /auth/login** with:
   ```json
   { "username": "user", "password": "Password123!" }
Calls AuthService.validateUser() to check credentials.

Calls AuthService.login() to generate a JWT token.

Returns:

json
Copy code
{ "access_token": "..." }
💡 Note:
The access token is what the client will use for all protected requests.

3️⃣ AuthService (src/auth/auth.service.ts)
Responsibilities:

Validate credentials

Generate JWT

ts
Copy code
async validateUser(loginUserDto: LoginUserDto) {
  const { username, password } = loginUserDto;
  const user = await this.usersService.findByUsername(username);

  if (!user) throw new UnauthorizedException('Invalid credentials');

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

  const { password: _, ...result } = user;
  return result; // UserResponseDto
}

login(user: UserResponseDto) {
  const payload = { username: user.username, sub: user.id, role: user.role };
  return { access_token: this.jwtService.sign(payload) };
}
🧩 Flow Explained:
validateUser() checks if the user exists and if the password matches (using bcrypt).

Returns the user object (without password) if valid.

login() creates a JWT token containing:

json
Copy code
{
  "username": "john",
  "sub": 1,
  "role": "admin"
}
JWT is signed using the secret stored in JWT_SECRET and expires in 15 minutes.

Client stores the token (e.g., localStorage) and sends it in future requests.

4️⃣ JwtStrategy (src/auth/jwt.strategy.ts)
Purpose: Validate incoming JWT tokens on protected routes.

ts
Copy code
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error('JWT_SECRET not set!');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  validate(payload: JwtPayload) {
    return {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
}
🧩 Flow Explained:
Intercepts every request protected by @UseGuards(AuthGuard('jwt')).

Extracts token from header:

makefile
Copy code
Authorization: Bearer <token>
Verifies the token signature and expiration.

Calls validate(payload) with decoded JWT.

Returns a user object attached to request.user:

json
Copy code
{
  "id": 1,
  "username": "john",
  "role": "admin"
}
5️⃣ PassportModule + JwtModule
PassportModule integrates NestJS with Passport strategies (JWT).

JwtModule.register({...}) provides JwtService for signing tokens.

AuthService injects JwtService and calls sign(payload) to create JWTs.

6️⃣ Full Flow Summary
Client sends:

json
Copy code
POST /auth/login
{ "username": "admin", "password": "Password123!" }
AuthController.login() → calls AuthService.validateUser().

AuthService.validateUser():

Fetches user from DB via UsersService.

Validates password with bcrypt.

Throws UnauthorizedException if invalid.

AuthService.login():

Creates signed JWT with payload { id, username, role }.

Returns { access_token: "..." }.

Client stores token.

For protected routes:

Sends header Authorization: Bearer <token>.

JwtStrategy validates token.

validate() attaches user info to req.user.

Controllers and guards can now use req.user to enforce RBAC.

7️⃣ Important Notes
Tokens expire in 15 minutes.

To add refresh tokens, create a separate secure flow.

Roles (admin | operator) are stored in the JWT payload.

JWT is stateless — no sessions are stored.

DTOs ensure validation and type safety.

👤 User Registration (Auth – Register)
1️⃣ Register Endpoint
Route: POST /auth/register
Purpose: Create new users with default role operator.
Admins cannot be created through this endpoint.

DTO: RegisterUserDto

ts
Copy code
// src/auth/dto/register-user.dto.ts
import { IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  fullName?: string;
}
✅ DTOs automatically validate input via NestJS ValidationPipe.

2️⃣ Flow in AuthController
ts
Copy code
@Post('register')
async register(@Body() registerUserDto: RegisterUserDto): Promise<UserResponseDto> {
  return this.authService.register(registerUserDto);
}
Steps:

Controller receives validated payload.

Sends to AuthService.

Returns UserResponseDto (without password).

3️⃣ AuthService – Creating a User
ts
Copy code
async register(registerUserDto: RegisterUserDto): Promise<UserResponseDto> {
  const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);
  const role: 'operator' = 'operator';

  const user = await this.usersService.createUser({
    ...registerUserDto,
    password: hashedPassword,
    role,
  });

  const { password, ...result } = user;
  return result;
}
✅ Notes:

Passwords are hashed before saving.

Default role is operator (no admin escalation).

UsersService handles DB operations.

4️⃣ Testing with Postman / curl
Request:

bash
Copy code
POST http://localhost:3000/api/auth/register
Content-Type: application/json
Body:

json
Copy code
{
  "username": "newuser",
  "password": "Password123!",
  "fullName": "New User"
}
Response:

json
Copy code
{
  "id": 2,
  "username": "newuser",
  "role": "operator",
  "fullName": "New User",
  "createdAt": "2025-10-25T12:45:00.000Z"
}
✅ Role is always operator, password is never returned.

🛡️ Admin Role Management
The backend enforces role-based access control (RBAC) using Guards and Decorators.

📂 Update Role Endpoint (users.controller.ts)
ts
Copy code
@Patch(':id/role')
@Roles('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
updateUserRole(
  @Param('id', ParseIntPipe) id: number,
  @Body('role') role: 'admin' | 'operator',
) {
  return this.usersService.updateRole(id, role);
}
🔍 Explanation
@Patch(':id/role') — updates user role by ID.

@Roles('admin') — only admins allowed.

JwtAuthGuard — validates JWT.

RolesGuard — checks if user’s role matches allowed roles.

Calls UsersService.updateRole() to perform update.

🧠 Service: users.service.ts
ts
Copy code
async updateRole(userId: number, role: 'admin' | 'operator') {
  const user = await this.userRepository.findOne({ where: { id: userId } });
  if (!user) throw new NotFoundException('User not found');
  user.role = role;
  return this.userRepository.save(user);
}
Flow:

Fetch user by ID.

Throw error if not found.

Update role.

Save to DB.

🧩 Guards & Decorators
JwtAuthGuard: validates JWT token, populates request.user.

RolesGuard: checks if request.user.role matches allowed roles.

@Roles(...): defines role metadata for endpoints.

🔄 Flow Summary
Admin logs in → receives JWT.

Sends:

bash
Copy code
PATCH /api/users/:id/role
Authorization: Bearer <token>
JwtAuthGuard validates token → sets request.user.

RolesGuard ensures request.user.role === 'admin'.

UsersService.updateRole() updates user role.

Returns updated user object.

✅ Only admins can promote or demote users.

🗑️ Delete User Endpoint
Controller – users.controller.ts
ts
Copy code
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Delete(':id')
async deleteUser(@Param('id') id: string) {
  return this.usersService.deleteUser(+id);
}
Service – users.service.ts
ts
Copy code
async deleteUser(id: number): Promise<{ message: string }> {
  const user = await this.usersRepository.findOneBy({ id });
  if (!user) throw new NotFoundException(`User with id ${id} not found`);

  await this.usersRepository.delete(id);
  return { message: `User with id ${id} successfully deleted` };
}
🧩 Flow Explanation
Request:
DELETE /api/users/:id

Guards:

JwtAuthGuard: validates JWT.

RolesGuard: checks if role is admin.

Service Logic:

Verifies user exists.

Deletes from DB.

Returns success message.

✅ Only admins can delete users.
Authentication — Refresh Token & Logout Flow

This section explains how JWT authentication with refresh tokens and logout is implemented in the backend (NestJS).

🔁 Refresh Token Flow

When a user logs in, the backend issues two tokens:

Access Token — short-lived (e.g., 15 minutes)

Refresh Token — long-lived (e.g., 7 days)

The access token is used for authenticated requests.
When it expires, the frontend sends the refresh token to get new tokens.

⚙️ Login & Refresh Logic

File: src/auth/auth.service.ts

async login(user: UserResponseDto): Promise<AuthResponseDto> {
  // 1️⃣ Payload for the access token
  const payload = { username: user.username, sub: user.id, role: user.role };
  const access_token = this.jwtService.sign(payload);

  // 2️⃣ Generate a refresh token (longer lifetime)
  const refreshToken = this.jwtService.sign(
    { sub: user.id },
    { expiresIn: '7d' },
  );

  // 3️⃣ Hash the refresh token and store it in the database
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
  await this.usersService.setCurrentRefreshToken(user.id, hashedRefreshToken);

  // 4️⃣ Return both tokens
  return { access_token, refresh_token: refreshToken };
}

🔄 Refresh Endpoint

File: src/auth/auth.controller.ts

@Post('refresh')
async refresh(@Body() dto: RefreshTokenDto) {
  // 1️⃣ Decode refresh token to extract userId
  const decoded = this.authService.decodeRefreshToken(dto.refresh_token);
  if (!decoded?.sub) throw new UnauthorizedException('Invalid token');

  // 2️⃣ Validate and issue new tokens
  return this.authService.refreshTokens(decoded.sub, dto.refresh_token);
}


File: src/auth/auth.service.ts

async refreshTokens(userId: number, refreshToken: string): Promise<AuthResponseDto> {
  const user = await this.usersService.findById(userId);
  if (!user || !user.refreshToken) throw new UnauthorizedException();

  // Check if provided refresh token matches hashed one from DB
  const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
  if (!isValid) throw new UnauthorizedException();

  // If valid → issue new tokens
  return this.login(user);
}

🔑 DTOs

File: src/auth/dto/refresh-token.dto.ts

import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  refresh_token: string;
}


File: src/auth/dto/auth-response.dto.ts

export class AuthResponseDto {
  access_token: string;
  refresh_token: string;
}

🧹 Logout Flow

When the user logs out, we invalidate the refresh token by removing it from the database.

File: src/auth/auth.service.ts

async logout(userId: number): Promise<void> {
  await this.usersService.removeRefreshToken(userId);
}


File: src/users/users.service.ts

async removeRefreshToken(userId: number): Promise<void> {
  await this.userRepo.update(userId, { refreshToken: null });
}


File: src/auth/auth.controller.ts

@UseGuards(JwtAuthGuard)
@Post('logout')
async logout(@GetUser('id') userId: number) {
  await this.authService.logout(userId);
  return { message: 'Logged out successfully' };
}

👤 @GetUser Custom Decorator

Instead of manually accessing req.user, we use a clean NestJS decorator:

File: src/auth/decorators/get-user.decorator.ts

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: keyof any | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);


Usage example:

@GetUser() user
@GetUser('id') userId
@GetUser('role') role

⚙️ Refresh Flow Summary

Login:

User sends credentials → receives access_token + refresh_token.

Refresh token (hashed) is stored in DB.

Access Token Expired:

Frontend gets 401 Unauthorized.

Sends POST /auth/refresh with refresh_token.

Backend Validation:

Decodes refresh token to extract sub (userId).

Validates token against hashed DB value.

Returns new tokens.

Logout:

User calls POST /auth/logout.

Backend clears refresh token hash from DB.

Refresh token is now invalid.

✅ Security Notes

Refresh tokens are hashed before being stored in DB.

Access tokens are short-lived, reducing risk.

Refresh tokens can be revoked instantly via logout.

Frontend should store refresh tokens securely (e.g., httpOnly cookie or secure storage).
Devices Module

The Devices Module is responsible for managing the lifecycle of IoT devices in the RTX Device Manager platform.
It handles device registration, updates, listing, and removal — all with proper authentication and role-based access control.

📁 Structure
src/
 └── devices/
     ├── device.entity.ts
     ├── devices.controller.ts
     ├── devices.service.ts
     ├── devices.module.ts
     ├── dto/
     │   ├── create-device.dto.ts
     │   └── update-device.dto.ts

⚙️ Endpoints
Method	Endpoint	Auth	Role	Description
POST	/api/devices	JWT	admin	Create a new device
GET	/api/devices	JWT	any	Get all devices
GET	/api/devices/:id	JWT	any	Get device details by ID
PATCH	/api/devices/:id	JWT	admin	Update a device (e.g., name, model, firmware version, status)
DELETE	/api/devices/:id	JWT	admin	Remove a device
🧠 DTOs

CreateDeviceDto

export class CreateDeviceDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(3)
  serial: string;

  @IsOptional()
  @IsString()
  model?: string;
}


UpdateDeviceDto

export class UpdateDeviceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  firmwareVersion?: string;

  @IsOptional()
  @IsIn(['online', 'offline'])
  status?: 'online' | 'offline';
}

🔒 Security

All routes are protected with JwtAuthGuard.

Administrative routes (POST, PATCH, DELETE) are further restricted by RolesGuard and @Roles('admin').

Example:

@Post()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
create(@Body() dto: CreateDeviceDto) {
  return this.devicesService.create(dto);
}

🧱 Entity
@Entity()
export class Device {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  serial: string;

  @Column({ nullable: true })
  model?: string;

  @Column({ default: 'offline' })
  status: 'online' | 'offline';

  @Column({ nullable: true })
  firmwareVersion?: string;

  @CreateDateColumn()
  createdAt: Date;
}

🧩 Example JSON (for testing in Insomnia/Postman)
{
  "name": "RTX-Gateway-1",
  "serial": "SN-001-RT",
  "model": "RTX-X200",
  "firmwareVersion": "1.0.0"
}