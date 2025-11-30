class AuthenticationController < ApplicationController
  # POST /auth/login
  def login
    @user = User.find_by(email: params[:email])
    if @user&.authenticate(params[:password])
      token = JsonWebToken.encode(user_id: @user.id)
      time = Time.now + 24.hours.to_i
      render json: { token: token, exp: time.strftime("%m-%d-%Y %H:%M"),
                     username: @user.email }, status: :ok
    else
      render json: { error: "unauthorized" }, status: :unauthorized
    end
  end

  # DELETE /auth/logout
  def logout
    # Since we are using stateless JWTs, the server doesn't need to do anything
    # to "log out" the user. The client should simply delete the token.
    # However, if we implemented a token blocklist (e.g. in Redis),
    # we would add the token to the blocklist here.
    render json: { message: "Logged out successfully" }, status: :ok
  end

  private

  def login_params
    params.permit(:email, :password)
  end
end
