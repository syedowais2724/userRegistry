# Stage 1: Build the Go binary
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Install git and certificates
RUN apk update && apk add --no-cache git ca-certificates

# Copy dependency configs
COPY go.mod go.sum ./
# If go.sum doesn't exist yet, we download dependencies anyway
RUN go mod download || true

# Copy all source files
COPY . .

# Generate SQLC code if sqlc is installed/prebuilt
# If SQLC isn't in builder, it's fine since we run sqlc generate on host before or build with generated files.
# We will compile the server binary
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/server cmd/server/main.go

# Stage 2: Final lightweight container
FROM alpine:3.19

WORKDIR /app

# Copy CA certificates for secure connections
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
# Copy the compiled binary
COPY --from=builder /app/server /app/server
# Copy the .env configuration template (we will override this with compose envs)
COPY --from=builder /app/.env.example /app/.env

EXPOSE 8080

CMD ["/app/server"]
