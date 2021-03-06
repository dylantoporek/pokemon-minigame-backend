class User < ApplicationRecord
    has_many :user_favorites
    has_many :pokemon, through: :user_favorites

    has_secure_password
    validates :username, uniqueness: true, presence: true
end
