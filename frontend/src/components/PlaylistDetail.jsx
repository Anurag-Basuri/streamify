import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const PlaylistDetail = () => {
    const { playlistID } = useParams();

    const [playlist, setPlaylist] = useState(null);

    useEffect(() => {
        const fetchPlaylist = async () => {
            const response = await axios.get(`/api/playlists/${playlistID}`);
            setPlaylist(response.data);
        };
        fetchPlaylist();
    }, [playlistID]);

    return (
        <>
            {playlist && (
                <div>
                    <h1>{playlist.name}</h1>
                </div>
            )}
        </>
    );
};

export default PlaylistDetail;
