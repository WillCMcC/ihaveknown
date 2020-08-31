import { useMutation, queryCache } from "react-query";
import Axios from "axios";
import * as ImagePicker from "expo-image-picker";
import * as Crypto from "expo-crypto";

const newSquid = async ({ mapRegion, type }) => {
  let result;
  if (type == "camera") {
    result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.25,
    });
  } else {
    result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.25,
    });
  }

  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    result.uri
  );

  const locationHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${mapRegion.latitude}-${mapRegion.longitude}-${Date.now()}`
  );

  const body = new FormData();
  body.append("squid", {
    name: hash + ".jpg",
    type: "image/jpg",
    uri: result.uri,
  });

  let imageUploadResult;
  try {
    imageUploadResult = await Axios.post(
      "https://images.squidmaps.com/upload",
      body,
      {
        headers: {
          "content-type": "multipart/form-data",
        },
      }
    );
  } catch (error) {
    console.log(error);
  }

  let dad = await imageUploadResult.data;

  let squid = {
    squid_id: locationHash,
    latitude: mapRegion.latitude,
    longitude: mapRegion.longitude,
    created_timestamp: new Date().toISOString(),
    updated_timestamp: new Date().toISOString(),
    visible: "true",
    reviewed: "true",
  };

  let squidResult;
  try {
    squidResult = await Axios.post(
      "https://squidmaps-postgrest.herokuapp.com/squid",
      squid
    );
  } catch (error) {
    console.log(JSON.stringify(error));
  }

  let image = {
    url: `https://${dad.url}`,
    image_id: hash,
    created_on: new Date().toISOString(),
  };

  let imageRowResult;
  try {
    imageRowResult = await Axios.post(
      "https://squidmaps-postgrest.herokuapp.com/image",
      image
    );
  } catch (error) {
    console.log(JSON.stringify(error));
  }

  let squidImageRelation = {
    squid_id: locationHash,
    image_id: hash,
  };

  let relationResult;
  try {
    relationResult = await Axios.post(
      "https://squidmaps-postgrest.herokuapp.com/squid_image_relation",
      squidImageRelation
    );
  } catch (error) {
    console.log(JSON.stringify(error));
  }
  return {
    ...squid,
    squid_image_relation: [{ image }],
  };
};

export default function createSquid(setAddingNewSquid, setFocusSquid) {
  return useMutation(newSquid, {
    onSuccess: (newData) => {
      queryCache.cancelQueries("posts");

      const previousValue = queryCache.getQueryData("posts");

      queryCache.setQueryData("posts", (old) => {
        return [...old, newData];
      });

      setAddingNewSquid(false);
      showSquidModal(false)
      setFocusSquid(newData)
      showSquidModal(true)
      return previousValue;
    },
    onSettled: () => {
      queryCache.invalidateQueries("posts");
    },
    onError: (err, variables, previousValue) =>
      queryCache.setQueryData("posts", previousValue),
  });
}
