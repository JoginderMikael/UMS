# Stage 1: Build
FROM maven:3-eclipse-temurin-25-alpine AS build
WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:25-jre
WORKDIR /app

# Copy the built jar
COPY --from=build /app/target/*.jar app.jar

# Set environment variables for DB and Redis (can be overridden by docker-compose)
ENV SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/unidata
ENV SPRING_DATASOURCE_USERNAME=uniuser
ENV SPRING_DATASOURCE_PASSWORD=unipass
ENV REDIS_HOST=redis
ENV REDIS_PORT=6379

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
