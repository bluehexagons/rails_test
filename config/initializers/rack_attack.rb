class Rack::Attack
  # Throttle all requests by IP
  # Key: "rack::attack:#{Time.now.to_i/:period}:req/ip:#{req.ip}"
  throttle("req/ip", limit: 200, period: 5.minutes) do |req|
    unless req.path == "/entities/increment" && req.post?
      req.ip
    end
  end

  # Throttle login attempts by IP
  # Key: "rack::attack:#{Time.now.to_i/:period}:logins/ip:#{req.ip}"
  throttle("logins/ip", limit: 5, period: 20.seconds) do |req|
    if req.path == "/auth/login" && req.post?
      req.ip
    end
  end

  # Throttle login attempts by email/username parameter
  # Key: "rack::attack:#{Time.now.to_i/:period}:logins/email:#{req.params['email']}"
  throttle("logins/identifier", limit: 3, period: 1.minute) do |req|
    if req.path == "/auth/login" && req.post?
      req.params["email"].to_s.downcase.presence || req.params["username"].to_s.downcase.presence
    end
  end

  throttle("signups/ip", limit: 5, period: 1.minute) do |req|
    if req.path == "/auth/signup" && req.post?
      req.ip
    end
  end

  throttle("increment/user", limit: 320, period: 1.minute) do |req|
    if req.path == "/entities/increment" && req.post?
      auth_header = req.env["HTTP_AUTHORIZATION"]
      if auth_header&.start_with?("Bearer ")
        token = auth_header.split(" ").last
        token
      else
        req.ip
      end
    end
  end

  # Allow all local traffic
  safelist("allow-localhost") do |req|
    "127.0.0.1" == req.ip || "::1" == req.ip
  end
end
