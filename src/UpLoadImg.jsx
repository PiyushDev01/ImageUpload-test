import React, { useRef, useState, useEffect } from "react";
import { getStorage, ref, listAll, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import app from "./firebase/firebase";
import Cropper from 'react-easy-crop';
import { getCroppedImg } from './cropImageHelper.js';

const UpLoadImg = () => {
  const inputRef = useRef(null);

  
  const [imageUrls, setImageUrls] = useState([]);
  const [image, setImage] = useState(null);
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState("");
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const fetchImages = async () => {
      const storage = getStorage();
      const imagesRef = ref(storage, 'images/');  // Reference to the 'images' directory in Firebase Storage
      
      try {
        // List all items in the directory
        const result = await listAll(imagesRef);
        
        // Map over items and get download URLs
        const urlPromises = result.items.map((imageRef) => getDownloadURL(imageRef));

        // Wait for all the URLs to be fetched
        const urls = await Promise.all(urlPromises);

        // Set the URLs in the state
        setImageUrls(urls);
      } catch (error) {
        console.error("Error fetching images: ", error);
      }
    };

    fetchImages();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file)); // Create a URL for the selected image
    }
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels); // Save the cropped area
  };

  const handleUpload = async () => {
    if (!image) {
      alert("Please choose a file first!");
      return;
    }

    try {
      const croppedImageBlob = await getCroppedImg(image, croppedAreaPixels);
      const storage = getStorage(app);
      const storageRef = ref(storage, `images/uploaded_${Date.now()}.jpg`);
      const uploadTask = uploadBytesResumable(storageRef, croppedImageBlob);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          console.error("Upload failed:", error);
          alert("Upload failed. Please try again.");
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUrl(downloadURL);
          console.log("File available at", downloadURL);
        }
      );
    } catch (error) {
      console.error("Error uploading cropped image:", error);
      alert("Error uploading image. Please try again.");
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleImageChange}
        ref={inputRef}
      />
      <button onClick={() => inputRef.current.click()}>Choose Image</button>
      <br /> <br />

      {image && (
        <>
          <div style={{ position: 'relative', width: 400, height: 565 }}>
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={1 / 1.414}  // A4 ratio
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <br />
          <button onClick={handleUpload}>Upload Image</button>
          <br />
          <progress value={progress} max="100" /> <br />
        </>
      )}
        { 
        
          imageUrls.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Uploaded ${index}`}
              style={{ width: 200 }}
            />
          ))
        }
     
    </div>
  );
};

export default UpLoadImg;
