FROM --platform=$BUILDPLATFORM gcr.io/distroless/nodejs18-debian12

WORKDIR /app
ADD packages/backend/build .

CMD ["bundle.js"]