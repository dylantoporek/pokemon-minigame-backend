class Api::V1::PokemonsController < ApplicationController
    skip_before_action :authorize
    def index
        render json: Pokemon.all, status: :ok
    end

    def show
        pokemon = Pokemon.find_by(id: params[:id])
        render json: pokemon, status: :ok
    end

end
