class AddIndexToRefreshTokensUserId < ActiveRecord::Migration[8.1]
  def change
    # Note: SQLite automatically creates an index on foreign keys,
    # so we only add the composite index for querying by user and status
    add_index :refresh_tokens, [ :user_id, :revoked, :expires_at ], name: 'index_refresh_tokens_on_user_and_status'
  end
end
