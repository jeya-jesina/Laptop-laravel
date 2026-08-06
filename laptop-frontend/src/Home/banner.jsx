import bannerImage from "../assets/banner.png";

function Banner() {
  return (
    <section className="pt-[100px] pb-8">
      <div
        className="max-w-[1220px] mx-auto h-[540px] bg-cover bg-center flex items-center"
        style={{ backgroundImage: `url(${bannerImage})` }}
      >
        <div className="ml-[55px] max-w-[420px] text-white">
          {/* Heading */}
         <h1 className="font-porsha text-4xl sm:text-4xl md:text-5xl lg:text-[58px] font-normal leading-[100%] tracking-[0px]">
  Styled For Every
  <br />
  Cherished Moments
</h1>
          {/* Offer */}
          <div className="mt-8 flex items-end gap-2">
            <span className="text-[16px] font-medium uppercase mb-[6px]">
              FLAT
            </span>

            <span className="font-porsha text-2xl sm:text-3xl md:text-4xl lg:text-[48px] leading-none">
              30-50%
            </span>

            <span className="text-[20px] uppercase mb-[6px]">
              OFF
            </span>
          </div>

          {/* Button */}
          {/* <button className="mt-10 h-[48px] w-[130px] bg-white text-black text-[12px] font-semibold hover:bg-black hover:text-white transition duration-300">
            SHOP NOW
          </button> */}
        </div>
      </div>
    </section>
  );
}

export default Banner;