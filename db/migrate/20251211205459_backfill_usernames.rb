class BackfillUsernames < ActiveRecord::Migration[8.1]
  def up
    User.where(username: nil).find_each do |user|
      email_start = user.email.split('@').first.gsub(/[^a-zA-Z0-9_-]/, '')
      random_suffix = rand(1000..9999)
      generated_username = "#{email_start}_#{user.id}_#{random_suffix}"

      suffix_length = 1 + user.id.to_s.length + 1 + 4
      available_len = 20 - suffix_length

      if available_len < 1
         email_start = "u"
         available_len = 20 - (1 + user.id.to_s.length + 1 + 4)
      end

      if email_start.length > available_len
        email_start = email_start[0...available_len]
      end

      generated_username = "#{email_start}_#{user.id}_#{random_suffix}"

      user.update_columns(username: generated_username)
    end

    change_column_null :users, :username, false
  end

  def down
    change_column_null :users, :username, true
  end
end
