# Be sure to restart your server when you modify this file.

# Avoid CORS issues when API is called from the frontend app.
# Handle Cross-Origin Resource Sharing (CORS) in order to accept cross-origin Ajax requests.

# Read more: https://github.com/cyu/rack-cors

allowed_origins = ENV.fetch("CORS_ORIGINS", ENV.fetch("FRONTEND_URL", "http://localhost:5173"))
  .split(",")
  .map(&:strip)
  .reject(&:blank?)

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # infra_tools supplies all public origins as a comma-separated value during
    # deployment. FRONTEND_URL remains supported for local and older deployers.
    origins(*allowed_origins)

    resource "*",
      headers: :any,
      methods: [ :get, :post, :put, :patch, :delete, :options, :head ]
  end
end
