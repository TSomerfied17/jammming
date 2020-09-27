let accessToken;
const clientId = `b4b167bb29d74f859f79c1c9500b467d`;
const redirectId = `http://undesirable-camera.surge.sh/`;

const Spotify = {
    getAccessToken () {
        if(accessToken){
            return accessToken;
        }
        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);
        if(accessTokenMatch && expiresInMatch) {
            accessToken = accessTokenMatch[1];
            const expiresIn = Number(expiresInMatch[1]);
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return accessToken;
        }else {
            const accessURL = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectId}`
            window.location = accessURL;
        }
    },

    search (term) {
        const accessToken = Spotify.getAccessToken();
        return fetch (`https://api.spotify.com/v1/search?type=track&q=${term}`,
        {
            headers : {Authorization : `Bearer ${accessToken}`}
        }).then(response => {
            return response.json();
        }).then(jsonResponse => {
            if (!jsonResponse.tracks) {
                return [];
              }
                return jsonResponse.tracks.items.map(tracks => ({
                    id: tracks.id,
                    name: tracks.name,
                    artists: tracks.artists[0].name,
                    album: tracks.album.name,
                    uri: tracks.uri
                }))
        });
    },

    savePlaylist (name, trackUris) {
        if(!name || !trackUris.length){
          return;
        }

        const accessToken = Spotify.getAccessToken();
        const headers = {Authorization : `Bearer ${accessToken}`};
        let userId;

        return fetch (`https://api.spotify.com/v1/me`,{headers : headers}
        ).then(response => response.json()
        ).then(jsonResponse => {
            userId = jsonResponse.id;
        return fetch (`https://api.spotify.com/v1/users/${userId}/playlists`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({name: name})
        }).then(response => response.json()
        ).then(jsonResponse => {
            const playlistId = jsonResponse.id;
            return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
                headers: headers,
                method: 'POST',
                body: JSON.stringify({uris: trackUris})
            });
        });
      });
    }
  };

export default Spotify;