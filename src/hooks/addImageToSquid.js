import { useMutation, queryCache } from "react-query";
import Axios from "axios";
import * as ImagePicker from "expo-image-picker";
import * as Crypto from "expo-crypto";

const addImage = async ({ focusSquid, type }) => {

  let result;
  if (type == "camera") {
    try {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.25,
      });
    } catch (error) {
      console.log(error)
    }
    
  } else {
    result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.25,
    });
  }
  console.log(result)
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    result.uri
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
    squid_id: focusSquid.squid_id,
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
  console.log({
    ...focusSquid,
    squid_image_relation: [...focusSquid.squid_image_relation, { image }],
  })
  return {
    ...focusSquid,
    squid_image_relation: [...focusSquid.squid_image_relation, { image }],
  };
};

export default function addImageToSquid(setFocusSquid, setAddingNewSquid, showSquidModal) {
  return useMutation(addImage, {
    onSuccess: (newData) => {
      queryCache.cancelQueries("posts");

      const previousValue = queryCache.getQueryData("posts");

      queryCache.setQueryData("posts", (old) => {
        return old.map((item)=>{  
          if(item.squid_id === newData.squid_id){
            return newData
          }
          return item
        });
      });
      showSquidModal(false)
      setFocusSquid(newData)
      showSquidModal(true)
      setAddingNewSquid(false)
      return previousValue;
    },
    onSettled: () => {
      queryCache.invalidateQueries("posts");
    },
    onError: (err, variables, previousValue) =>
      queryCache.setQueryData("posts", previousValue),
  });
}
