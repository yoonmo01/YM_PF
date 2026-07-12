FROM eclipse-temurin:21-jdk-jammy AS build

WORKDIR /workspace

COPY gradlew gradlew.bat build.gradle settings.gradle ./
COPY gradle ./gradle
RUN chmod +x gradlew && ./gradlew --no-daemon dependencies

COPY src ./src
RUN ./gradlew --no-daemon bootJar

FROM eclipse-temurin:21-jre-jammy AS runtime

RUN apt-get update \
    && apt-get install --yes --no-install-recommends fonts-nanum wget \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system app \
    && useradd --system --gid app --home-dir /app app
WORKDIR /app

COPY --from=build --chown=app:app /workspace/build/libs/app.jar ./app.jar

USER app
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --quiet --output-document=- http://localhost:8080/actuator/health | grep --quiet '"status":"UP"' || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
