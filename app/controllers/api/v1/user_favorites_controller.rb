class Api::V1::UserFavoritesController < ApplicationController
    def index
        render json: @current_user.user_favorites, status: :ok
    end

    def show
        favorite = @current_user.user_favorites.find_by(id: params[:id])
        render json: favorite, status: :ok
    end

    def create
        favorite = @current_user.user_favorites.create!(favorite_params)
        render json: favorite, status: :ok
    end

    def destroy
        favorite = @current_user.user_favorites.find_by(id: params[:id])
        favorite.delete
        head :no_content
    end

    private

    def favorite_params
        params.require(:newFav).permit(:pokemon_id)
    end
end
