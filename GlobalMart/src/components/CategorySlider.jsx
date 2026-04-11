import React, { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const BestSellerSlider = () => {
  const [clothingIndex, setClothingIndex] = useState(0);
  const [toysIndex, setToysIndex] = useState(0);
  const [computersIndex, setComputersIndex] = useState(0);
  const [cameroonIndex, setCameroonIndex] = useState(0);
  const [beautyIndex, setBeautyIndex] = useState(0);

  const SLIDE_WIDTH = 224;
  const HORIZONTAL_SLIDE_WIDTH = 204;

  const clothingItems = [
    {
      id: 1,
      image: "https://picsum.photos/id/1015/280/280",
      name: "T-Shirts Pack",
    },
    {
      id: 2,
      image: "https://picsum.photos/id/1060/280/280",
      name: "Blue Crocs",
    },
    {
      id: 3,
      image: "https://picsum.photos/id/1074/280/280",
      name: "Black Crocs",
    },
    {
      id: 4,
      image: "https://picsum.photos/id/201/280/280",
      name: "Black Leggings",
    },
    {
      id: 5,
      image: "https://picsum.photos/id/133/280/280",
      name: "Black T-Shirt",
    },
    {
      id: 6,
      image: "https://picsum.photos/id/1027/280/280",
      name: "White Top",
    },
    {
      id: 7,
      image: "https://picsum.photos/id/870/280/280",
      name: "Flip Flops",
    },
  ];

  const toysItems = [
    {
      id: 1,
      image: "https://picsum.photos/id/201/280/280",
      name: "Unicorn Plush",
    },
    {
      id: 2,
      image: "https://picsum.photos/id/1060/280/280",
      name: "Furry Alien",
    },
    {
      id: 3,
      image: "https://picsum.photos/id/133/280/280",
      name: "Tokyo Revengers",
    },
    {
      id: 4,
      image: "https://picsum.photos/id/1074/280/280",
      name: "Magnetic Tiles",
    },
    {
      id: 5,
      image: "https://picsum.photos/id/870/280/280",
      name: "Dragon Toy",
    },
    {
      id: 6,
      image: "https://picsum.photos/id/1027/280/280",
      name: "LEGO Technic",
    },
    { id: 7, image: "https://picsum.photos/id/201/280/280", name: "Dino Egg" },
  ];

  const categorySections = [
    {
      title: "Gear up to get fit",
      items: [
        { label: "Clothing", image: "https://picsum.photos/id/1015/280/280" },
        { label: "Trackers", image: "https://picsum.photos/id/106/280/280" },
        { label: "Equipment", image: "https://picsum.photos/id/201/280/280" },
        { label: "Deals", image: "https://picsum.photos/id/133/280/280" },
      ],
      linkText: "Discover more",
    },
    {
      title: "Level up your beauty routine",
      items: [
        { label: "Makeup", image: "https://picsum.photos/id/1074/280/280" },
        { label: "Brushes", image: "https://picsum.photos/id/1027/280/280" },
        { label: "Sponges", image: "https://picsum.photos/id/201/280/280" },
        { label: "Mirrors", image: "https://picsum.photos/id/133/280/280" },
      ],
      linkText: "See more",
    },
    {
      title: "Level up your gaming",
      items: [
        { label: "PC gaming", image: "https://picsum.photos/id/870/280/280" },
        { label: "Xbox", image: "https://picsum.photos/id/1060/280/280" },
        {
          label: "PlayStation",
          image: "https://picsum.photos/id/1015/280/280",
        },
        {
          label: "Nintendo Switch",
          image: "https://picsum.photos/id/1074/280/280",
        },
      ],
      linkText: "Shop the latest in gaming",
    },
    {
      title: "Most-loved watches",
      items: [
        { label: "Women", image: "https://picsum.photos/id/201/280/280" },
        { label: "Men", image: "https://picsum.photos/id/133/280/280" },
        { label: "Girls", image: "https://picsum.photos/id/106/280/280" },
        { label: "Boys", image: "https://picsum.photos/id/1027/280/280" },
      ],
      linkText: "Discover more",
    },
  ];

  const travelItems = [
    { label: "Backpacks", image: "https://picsum.photos/id/1015/280/180" },
    { label: "Suitcases", image: "https://picsum.photos/id/1060/280/180" },
    { label: "Accessories", image: "https://picsum.photos/id/201/280/180" },
    { label: "Handbags", image: "https://picsum.photos/id/133/280/180" },
  ];

  const pcItems = [
    { label: "Laptops", image: "https://picsum.photos/id/870/280/180" },
    { label: "PCs", image: "https://picsum.photos/id/1027/280/180" },
    { label: "Hard Drives", image: "https://picsum.photos/id/180/280/180" },
    { label: "Monitors", image: "https://picsum.photos/id/1074/280/180" },
  ];

  const familyItems = [
    {
      label: "Outdoor Play Sets",
      image: "https://picsum.photos/id/106/280/180",
    },
    { label: "Learning Toys", image: "https://picsum.photos/id/201/280/180" },
    { label: "Action Figures", image: "https://picsum.photos/id/133/280/180" },
    {
      label: "Pretend Play Toys",
      image: "https://picsum.photos/id/870/280/180",
    },
  ];

  const dealsItems = [
    { label: "Books", image: "https://picsum.photos/id/1015/280/180" },
    { label: "Fashion", image: "https://picsum.photos/id/1060/280/180" },
    { label: "PC", image: "https://picsum.photos/id/201/280/180" },
    { label: "Beauty", image: "https://picsum.photos/id/133/280/180" },
  ];

  const computersItems = [
    {
      image: "https://picsum.photos/id/180/280/180",
      label: "Screen Protector",
    },
    { image: "https://picsum.photos/id/201/280/180", label: "iPad Case" },
    { image: "https://picsum.photos/id/1060/280/180", label: "Backpack" },
    { image: "https://picsum.photos/id/133/280/180", label: "Stylus Pen" },
    {
      image: "https://picsum.photos/id/1074/280/180",
      label: "Glass Protector",
    },
    { image: "https://picsum.photos/id/870/280/180", label: "Printer" },
    { image: "https://picsum.photos/id/1027/280/180", label: "Water Bottle" },
  ];

  const cameroonItems = [
    { image: "https://picsum.photos/id/1015/280/180", label: "Body Lotion" },
    { image: "https://picsum.photos/id/106/280/180", label: "Poetry Book" },
    { image: "https://picsum.photos/id/201/280/180", label: "Power Tool" },
    { image: "https://picsum.photos/id/133/280/180", label: "Kids Ride On" },
    { image: "https://picsum.photos/id/1074/280/180", label: "Graphics Card" },
    { image: "https://picsum.photos/id/870/280/180", label: "Teeth Whitening" },
    { image: "https://picsum.photos/id/1027/280/180", label: "Lenovo Tablet" },
  ];

  const beautyItems = [
    {
      image: "https://picsum.photos/id/180/280/180",
      label: "Medicube Collagen",
    },
    { image: "https://picsum.photos/id/201/280/180", label: "Biodance Mask" },
    {
      image: "https://picsum.photos/id/1060/280/180",
      label: "Neutrogena Wipes",
    },
    { image: "https://picsum.photos/id/133/280/180", label: "Mighty Patch" },
    {
      image: "https://picsum.photos/id/1074/280/180",
      label: "Collagen Jelly Cream",
    },
    { image: "https://picsum.photos/id/870/280/180", label: "Vitamin C Cream" },
    { image: "https://picsum.photos/id/1027/280/180", label: "Vitamin Serum" },
  ];

  const nextClothing = () => {
    if (clothingIndex < clothingItems.length - 6)
      setClothingIndex(clothingIndex + 1);
  };
  const prevClothing = () => {
    if (clothingIndex > 0) setClothingIndex(clothingIndex - 1);
  };

  const nextToys = () => {
    if (toysIndex < toysItems.length - 6) setToysIndex(toysIndex + 1);
  };
  const prevToys = () => {
    if (toysIndex > 0) setToysIndex(toysIndex - 1);
  };

  const nextComputers = () => {
    if (computersIndex < computersItems.length - 5)
      setComputersIndex(computersIndex + 1);
  };
  const prevComputers = () => {
    if (computersIndex > 0) setComputersIndex(computersIndex - 1);
  };

  const nextCameroon = () => {
    if (cameroonIndex < cameroonItems.length - 5)
      setCameroonIndex(cameroonIndex + 1);
  };
  const prevCameroon = () => {
    if (cameroonIndex > 0) setCameroonIndex(cameroonIndex - 1);
  };

  const nextBeauty = () => {
    if (beautyIndex < beautyItems.length - 5) setBeautyIndex(beautyIndex + 1);
  };
  const prevBeauty = () => {
    if (beautyIndex > 0) setBeautyIndex(beautyIndex - 1);
  };

  const mainContainerStyle = {
    background: "#f3f3f3",
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
    fontFamily: "Arial, sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  };

  const sectionCardStyle = { background: "#ffffff", padding: "24px" };

  const titleStyle = {
    fontSize: "21px",
    fontWeight: "700",
    color: "#0F1111",
    marginBottom: "20px",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "16px",
  };

  const itemStyle = { textAlign: "center", cursor: "pointer" };

  const itemImageStyle = {
    width: "100%",
    height: "130px",
    objectFit: "contain",
    background: "#f9f9f9",
    padding: "8px",
  };

  const labelStyle = {
    fontSize: "14px",
    fontWeight: "600",
    color: "#0F1111",
    marginTop: "10px",
  };

  const linkStyle = {
    color: "#007185",
    fontSize: "14px",
    fontWeight: "600",
    marginTop: "20px",
    display: "inline-block",
    textDecoration: "none",
  };

  const sliderWrapperStyle = { position: "relative", overflow: "hidden" };
  const trackStyle = {
    display: "flex",
    gap: "24px",
    transition: "transform 0.5s ease",
  };
  const productCardStyle = { flex: "0 0 200px", cursor: "pointer" };
  const imageContainerStyle = {
    height: "200px",
    background: "#f9f9f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  };

  const arrowStyle = {
    position: "absolute",
    top: "40%",
    transform: "translateY(-50%)",
    background: "white",
    border: "1px solid #ddd",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 10,
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  };

  const horizontalWrapperStyle = { position: "relative", overflow: "hidden" };
  const horizontalTrackStyle = {
    display: "flex",
    gap: "20px",
    transition: "transform 0.5s ease",
  };
  const horizontalItemStyle = {
    flex: "0 0 180px",
    textAlign: "center",
    cursor: "pointer",
  };
  const horizontalImageStyle = {
    width: "100%",
    height: "140px",
    objectFit: "contain",
    background: "#f9f9f9",
    padding: "8px",
  };

  return (
    <div style={mainContainerStyle}>
      {/* Original Sliders */}
      <div style={sectionCardStyle}>
        <h2 style={titleStyle}>Best Sellers in Clothing, Shoes & Jewelry</h2>
        <div style={sliderWrapperStyle}>
          <button
            style={{ ...arrowStyle, left: "0" }}
            onClick={prevClothing}
            disabled={clothingIndex === 0}
          >
            <FiChevronLeft size={20} />
          </button>
          <div
            style={{
              ...trackStyle,
              transform: `translateX(-${clothingIndex * SLIDE_WIDTH}px)`,
            }}
          >
            {clothingItems.map((item) => (
              <div key={item.id} style={productCardStyle}>
                <div style={imageContainerStyle}>
                  <img
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                    src={item.image}
                    alt={item.name}
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            style={{ ...arrowStyle, right: "0" }}
            onClick={nextClothing}
            disabled={clothingIndex >= clothingItems.length - 6}
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>

      <div style={sectionCardStyle}>
        <h2 style={titleStyle}>Top Sellers in Toys for you</h2>
        <div style={sliderWrapperStyle}>
          <button
            style={{ ...arrowStyle, left: "0" }}
            onClick={prevToys}
            disabled={toysIndex === 0}
          >
            <FiChevronLeft size={20} />
          </button>
          <div
            style={{
              ...trackStyle,
              transform: `translateX(-${toysIndex * SLIDE_WIDTH}px)`,
            }}
          >
            {toysItems.map((item) => (
              <div key={item.id} style={productCardStyle}>
                <div style={imageContainerStyle}>
                  <img
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                    src={item.image}
                    alt={item.name}
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            style={{ ...arrowStyle, right: "0" }}
            onClick={nextToys}
            disabled={toysIndex >= toysItems.length - 6}
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* All 8 Grid Sections */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
        }}
      >
        {categorySections.map((section, index) => (
          <div key={index} style={sectionCardStyle}>
            <h2 style={titleStyle}>{section.title}</h2>
            <div style={gridStyle}>
              {section.items.map((item, i) => (
                <div key={i} style={itemStyle}>
                  <img
                    src={item.image}
                    alt={item.label}
                    style={itemImageStyle}
                    onError={(e) =>
                      (e.target.src =
                        "https://via.placeholder.com/140x140?text=Image")
                    }
                  />
                  <div style={labelStyle}>{item.label}</div>
                </div>
              ))}
            </div>
            <a href="#" style={linkStyle}>
              {section.linkText} →
            </a>
          </div>
        ))}

        <div style={sectionCardStyle}>
          <h2 style={titleStyle}>Most-loved travel essentials</h2>
          <div style={gridStyle}>
            {travelItems.map((item, i) => (
              <div key={i} style={itemStyle}>
                <img
                  src={item.image}
                  alt={item.label}
                  style={itemImageStyle}
                  onError={(e) =>
                    (e.target.src =
                      "https://via.placeholder.com/140x140?text=Image")
                  }
                />
                <div style={labelStyle}>{item.label}</div>
              </div>
            ))}
          </div>
          <a href="#" style={linkStyle}>
            Discover more →
          </a>
        </div>

        <div style={sectionCardStyle}>
          <h2 style={titleStyle}>Level up your PC here</h2>
          <div style={gridStyle}>
            {pcItems.map((item, i) => (
              <div key={i} style={itemStyle}>
                <img
                  src={item.image}
                  alt={item.label}
                  style={itemImageStyle}
                  onError={(e) =>
                    (e.target.src =
                      "https://via.placeholder.com/140x140?text=Image")
                  }
                />
                <div style={labelStyle}>{item.label}</div>
              </div>
            ))}
          </div>
          <a href="#" style={linkStyle}>
            Discover more →
          </a>
        </div>

        <div style={sectionCardStyle}>
          <h2 style={titleStyle}>Have more fun with family</h2>
          <div style={gridStyle}>
            {familyItems.map((item, i) => (
              <div key={i} style={itemStyle}>
                <img
                  src={item.image}
                  alt={item.label}
                  style={itemImageStyle}
                  onError={(e) =>
                    (e.target.src =
                      "https://via.placeholder.com/140x140?text=Image")
                  }
                />
                <div style={labelStyle}>{item.label}</div>
              </div>
            ))}
          </div>
          <a href="#" style={linkStyle}>
            See more →
          </a>
        </div>

        <div style={sectionCardStyle}>
          <h2 style={titleStyle}>Deals on top categories</h2>
          <div style={gridStyle}>
            {dealsItems.map((item, i) => (
              <div key={i} style={itemStyle}>
                <img
                  src={item.image}
                  alt={item.label}
                  style={itemImageStyle}
                  onError={(e) =>
                    (e.target.src =
                      "https://via.placeholder.com/140x140?text=Image")
                  }
                />
                <div style={labelStyle}>{item.label}</div>
              </div>
            ))}
          </div>
          <a href="#" style={linkStyle}>
            Discover more →
          </a>
        </div>
      </div>

      <div style={sectionCardStyle}>
        <h2 style={titleStyle}>Top picks for Cameroon</h2>
        <div style={horizontalWrapperStyle}>
          <button
            style={{ ...arrowStyle, left: "0" }}
            onClick={prevCameroon}
            disabled={cameroonIndex === 0}
          >
            <FiChevronLeft size={20} />
          </button>
          <div
            style={{
              ...horizontalTrackStyle,
              transform: `translateX(-${cameroonIndex * HORIZONTAL_SLIDE_WIDTH}px)`,
            }}
          >
            {cameroonItems.map((item, index) => (
              <div key={index} style={horizontalItemStyle}>
                <img
                  src={item.image}
                  alt={item.label}
                  style={horizontalImageStyle}
                  onError={(e) =>
                    (e.target.src =
                      "https://via.placeholder.com/180x140?text=Image")
                  }
                />
                <div style={labelStyle}>{item.label}</div>
              </div>
            ))}
          </div>
          <button
            style={{ ...arrowStyle, right: "0" }}
            onClick={nextCameroon}
            disabled={cameroonIndex >= cameroonItems.length - 5}
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>

      <div style={sectionCardStyle}>
        <h2 style={titleStyle}>Best Sellers in Computers & Accessories</h2>
        <div style={horizontalWrapperStyle}>
          <button
            style={{ ...arrowStyle, left: "0" }}
            onClick={prevComputers}
            disabled={computersIndex === 0}
          >
            <FiChevronLeft size={20} />
          </button>
          <div
            style={{
              ...horizontalTrackStyle,
              transform: `translateX(-${computersIndex * HORIZONTAL_SLIDE_WIDTH}px)`,
            }}
          >
            {computersItems.map((item, index) => (
              <div key={index} style={horizontalItemStyle}>
                <img
                  src={item.image}
                  alt={item.label}
                  style={horizontalImageStyle}
                  onError={(e) =>
                    (e.target.src =
                      "https://via.placeholder.com/180x140?text=Image")
                  }
                />
                <div style={labelStyle}>{item.label}</div>
              </div>
            ))}
          </div>
          <button
            style={{ ...arrowStyle, right: "0" }}
            onClick={nextComputers}
            disabled={computersIndex >= computersItems.length - 5}
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Best Sellers in Beauty & Personal Care */}
      <div style={sectionCardStyle}>
        <h2 style={titleStyle}>Best Sellers in Beauty & Personal Care</h2>
        <div style={horizontalWrapperStyle}>
          <button
            style={{ ...arrowStyle, left: "0" }}
            onClick={prevBeauty}
            disabled={beautyIndex === 0}
          >
            <FiChevronLeft size={20} />
          </button>
          <div
            style={{
              ...horizontalTrackStyle,
              transform: `translateX(-${beautyIndex * HORIZONTAL_SLIDE_WIDTH}px)`,
            }}
          >
            {beautyItems.map((item, index) => (
              <div key={index} style={horizontalItemStyle}>
                <img
                  src={item.image}
                  alt={item.label}
                  style={horizontalImageStyle}
                  onError={(e) =>
                    (e.target.src =
                      "https://via.placeholder.com/180x140?text=Image")
                  }
                />
                <div style={labelStyle}>{item.label}</div>
              </div>
            ))}
          </div>
          <button
            style={{ ...arrowStyle, right: "0" }}
            onClick={nextBeauty}
            disabled={beautyIndex >= beautyItems.length - 5}
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BestSellerSlider;
