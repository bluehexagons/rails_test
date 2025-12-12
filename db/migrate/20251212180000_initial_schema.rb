class InitialSchema < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.boolean :admin, default: false, null: false
      t.string :email
      t.string :password_digest
      t.string :username, null: false
      t.timestamps
    end
    add_index :users, :email, unique: true
    add_index :users, :username, unique: true

    create_table :entities do |t|
      t.integer :count
      t.datetime :created_time
      t.string :kind
      t.datetime :modified_time
      t.references :user, null: false, foreign_key: true
      t.timestamps
    end
    add_index :entities, [ :user_id, :kind ], unique: true
  end
end
