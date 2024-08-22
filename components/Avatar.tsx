import { User } from "lucide-react";
import Image from "next/image";
import React from "react";

const Avatar = ({ src }: { src?: string }) => {
  if (src) {
    return (
      <Image
        src={src}
        alt="Avatar"
        className="rounded-full"
        height={40}
        width={40}
      />
    );
  }
  return <User/> 
};

export default Avatar;
