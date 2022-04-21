class Pokemon < ApplicationRecord
    has_many :user_favorites
    has_many :users, through: :user_favorites
end
