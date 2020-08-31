import React from "react";
import { Map, Marker,  GoogleApiWrapper } from "google-maps-react";
import useSquids from "../hooks/useSquids.js";

const mapStyles = {
  width: "100%",
  height: "100%",
};
const MapContainer = (props) => {
  const { status, data, error, isFetching } = useSquids();

  return (
    <Map
      google={props.google}
      zoom={14}
      style={mapStyles}
      initialCenter={{
        lat: 37.78825,
        lng: -122.4324,
      }}
    >
      {data &&
        data.map((squid) => {
          console.log(squid);
        })}
    </Map>
  );
};

export default GoogleApiWrapper({
  apiKey: "AIzaSyAuqc7BI0QPN50aHlTyM7INNq4rrwlMWIo",
})(MapContainer);
