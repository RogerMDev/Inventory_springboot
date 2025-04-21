# Etapa 1: Construcción del proyecto con Maven
FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /app

# Copiamos el código fuente y el archivo pom.xml
COPY pom.xml .
COPY src ./src

# Construimos el proyecto (generará un archivo JAR en /target)
RUN mvn clean package -DskipTests

# Etapa 2: Imagen final más ligera con solo Java
FROM eclipse-temurin:17-jdk
WORKDIR /app

# Copiamos el archivo JAR desde la etapa anterior
COPY --from=build /app/target/*.jar /app/app.jar

# Puerto por defecto que usa Spring Boot
EXPOSE 8080

# Comando que se ejecuta al iniciar el contenedor
ENTRYPOINT ["java", "-jar", "/app/app.jar"]


