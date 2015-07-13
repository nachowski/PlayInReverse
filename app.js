(function(exports) {
	client_id = '17f243b944f14386af940a735d5c70c7';
	redirect_uri = 'https://nachiketapte.com/spotify-reverse';
	
	g_access_token = '';
	g_username = '';

	var doLogin = function(callback) {
		var url = 'https://accounts.spotify.com/authorize?client_id=' + client_id +
			'&response_type=token' +
			'&scope=playlist-read-private%20playlist-modify%20playlist-modify-private' +
			'&redirect_uri=' + encodeURIComponent(redirect_uri);
		window.location = url;
	}

	exports.startApp = function() {
		console.log('start app.');
		$('#start').click(function() {
			doLogin(function() {});
			}
		);
		// try getting an access_token
		var hash = location.hash.replace(/#/g, '');
		var all = hash.split('&');
		var args = {};
		console.log('all', all);
		all.forEach(function(keyvalue) {
			var idx = keyvalue.indexOf('=');
			var key = keyvalue.substring(0, idx);
			var val = keyvalue.substring(idx + 1);
			args[key] = val;
		});

		console.log('got args', args);

		if (typeof(args['access_token']) != 'undefined') {
			// got access token
			console.log('got access token', args['access_token']);
			g_access_token = args['access_token'];
		}

		if (g_access_token) {
			$('#start').hide();
		
			getUsername(function(username) {
				console.log('got username', username);
				g_username = username;
				
				getPlaylists(username, function(playlist) {
					console.log('got playlist', playlist);

					$.each(playlist.items, function(i, row) {
						$('#playlist-list').append('<li><a href="#" data-id="' + row.id + '">' + row.name + ' (' + row.tracks.total + ' tracks)</a></li>');
					});
					
					//$('#playlist-list').listview('refresh');
				});
			});
		}
	}

	$(document).on('click', '#playlist-list li a', function (e) {
		playlistId = $(this).attr('data-id');
		console.log("reversing " + playlistId);

		getTracksForPlaylist(g_username, playlistId, function(tracks) {
			// all the magic happens here:
			tracks.items.reverse();
			
			var reversed = {
				uris : []
			}
			
			// construct a reversed track list
			$.each(tracks.items, function(i, row) {
				reversed.uris.push("spotify:track:" + row.track.id);
			});
			
			setTracksForPlaylist(g_username, playlistId, reversed, function(resp) {
				console.log(resp);
				alert("Success!")
				
				$('#playlistlink').show();
				$('#playlistlink').attr('href', 'spotify:user:'+g_username+':playlist:'+playlistId);
			});
		});
	});



function getUsername(callback) {
	console.log('getUsername');
	var url = 'https://api.spotify.com/v1/me';
	$.ajax(url, {
		dataType: 'json',
		headers: {
			'Authorization': 'Bearer ' + g_access_token
		},
		success: function(r) {
			callback(r.id);
		},
		error: function(r) {
			callback(null);
		}
	});
}

function getPlaylists(username, callback) {
	console.log('getPlaylists', username);
	var url = 'https://api.spotify.com/v1/users/' + username + '/playlists/';
		
	$.ajax(url, {
		method: 'GET',
		headers: {
			'Authorization': 'Bearer ' + g_access_token,
			'Accept': 'application/json',
		},
		data:{
			'limit' : 50
		},
		success: function(r) {
			callback(r);
		},
		error: function(r) {
			callback(null);
		}
	});
}

function getTracksForPlaylist(username, playlist, callback) {
	console.log('getTracksForPlaylist', username, playlist);
	var url = 'https://api.spotify.com/v1/users/' + username + '/playlists/' + playlist + '/tracks';
		
	$.ajax(url, {
		method: 'GET',
		headers: {
			'Authorization': 'Bearer ' + g_access_token,
			'Accept': 'application/json'
		},
		success: function(r) {
			callback(r);
		},
		error: function(r) {
			callback(null);
		}
	});
}

function setTracksForPlaylist(username, playlist, tracks, callback) {
	console.log('setTracksForPlaylist', tracks, playlist);
	var url = 'https://api.spotify.com/v1/users/' + username + '/playlists/' + playlist + '/tracks';
		
	$.ajax(url, {
		method: 'PUT',
		data: JSON.stringify(tracks),
		headers: {
			'Authorization': 'Bearer ' + g_access_token,
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		success: function(r) {
			callback(r);
		},
		error: function(r) {
			callback(null);
		}
	});
}

})(window);
