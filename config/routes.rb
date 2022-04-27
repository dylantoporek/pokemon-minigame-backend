Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
    resources :user_favorites, only: [:index, :show, :create, :destroy]
    resources :pokemons, only: [:index, :show]
      post '/signup', to: 'users#create'
      get '/me', to: 'users#show'
      post '/login', to: 'sessions#create'
      delete '/logout', to: 'sessions#destroy'
    end
  end
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html
  get "*path", to: "fallback#index", constraints: ->(req) { !req.xhr? && req.format.html? }
  # Defines the root path route ("/")
  # root "articles#index"
end
