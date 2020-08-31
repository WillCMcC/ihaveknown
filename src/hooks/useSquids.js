import { useQuery } from "react-query";
import axios from "axios";

const getSquids = async () => {
  const { data } = await axios.get(
    "https://squidmaps-postgrest.herokuapp.com/squid?select=*,squid_image_relation(image(*))"
  );
  // return data.filter(squid => squid.squid_image_relation.length > 1);
  return data;
};

export default function useSquids() {
  return useQuery("posts", getSquids);
}
