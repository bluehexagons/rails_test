class AuthenticationController < ApplicationController
  # POST /auth/login
  def login
    identifier = params[:username] || params[:email]
    @user = User.find_by(username: identifier) || User.find_by(email: identifier)

    if @user&.authenticate(params[:password])
      # Short-lived access token (1 hour) + long-lived refresh token (60 days)
      access_token = JsonWebToken.encode(user_id: @user.id)
      refresh_raw = RefreshToken.generate_for(@user)
      time = Time.now + 1.hour.to_i
      render json: { token: access_token, exp: time.strftime("%m-%d-%Y %H:%M"), username: @user.username, refresh_token: refresh_raw }, status: :ok
    else
      render json: { error: "Invalid username or password" }, status: :unauthorized
    end
  end

  # POST /auth/refresh
  # Body: { refresh_token: "..." }
  def refresh
    raw = params[:refresh_token]
    if raw.blank?
      return render json: { error: "refresh_token required" }, status: :bad_request
    end

    digest = RefreshToken.digest_token(raw)
    rt = RefreshToken.find_by(token_digest: digest)

    if rt.nil? || rt.revoked? || rt.expires_at < Time.current
      return render json: { error: "Invalid or expired refresh token" }, status: :unauthorized
    end

    # rotate: revoke the old refresh token and issue a new one, plus a fresh short-lived access token
    ActiveRecord::Base.transaction do
      rt.update!(revoked: true)
      new_raw = RefreshToken.generate_for(rt.user)
      access_token = JsonWebToken.encode(user_id: rt.user.id)
      time = Time.now + 1.hour.to_i
      render json: { token: access_token, exp: time.strftime("%m-%d-%Y %H:%M"), refresh_token: new_raw }, status: :ok
    end
  end

  # DELETE /auth/logout
  def logout
    render json: { message: "Logged out successfully" }, status: :ok
  end

  private

  def login_params
    params.permit(:email, :password, :username)
  end
end
