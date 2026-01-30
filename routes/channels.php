<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Canal pour les alertes stock bas : tout utilisateur authentifié peut écouter
Broadcast::channel('low-stock', function ($user) {
    return $user !== null;
});
