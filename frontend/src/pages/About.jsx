import React from "react";
import bg2 from "../components/bg/bg2.jpg";
import { FiCheckCircle } from "react-icons/fi";

export default function About() {
    const testimonials = [
        {
            name: "Bonnie Green",
            title: "Lead Developer",
            image: "https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/karen-nelson.png",
            headline: "Seamless Experience",
            quote: "Shopping on SongTor Hub is fast, effortless, and secure. Highest recommendation!"
        },
        {
            name: "Roberta Casas",
            title: "Design Director",
            image: "https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/roberta-casas.png",
            headline: "Beautiful Interface",
            quote: "The vibrant marketplace design makes discovering quality items an absolute pleasure."
        },
        {
            name: "Jese Leos",
            title: "Operations Manager",
            image: "https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/jese-leos.png",
            headline: "Fast Delivery",
            quote: "Real-time order tracking and prompt delivery give complete peace of mind."
        },
        {
            name: "Joseph McFall",
            title: "Product Specialist",
            image: "https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/joseph-mcfall.png",
            headline: "Top Customer Care",
            quote: "Support team responded within minutes when I needed to update my delivery address."
        }
    ];

    const values = [
        { title: "Easy Trading", desc: "Simple platform for seamless buying & selling transactions." },
        { title: "Fast Shipping", desc: "Reliable logistics partners ensuring swift order delivery." },
        { title: "Safe & Secure", desc: "Protected payment channels & verified user profiles." },
    ];

    return (
        <div className="page-container pb-16">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gray-900 py-24 sm:py-32">
                <img src={bg2} alt="About Hero" className="absolute inset-0 w-full h-full object-cover object-center opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-r from-brand-600/80 to-accent-600/80" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl drop-shadow-md">
                        About SongTor Hub
                    </h1>
                    <p className="mt-4 text-xl text-white/90 max-w-2xl mx-auto font-medium drop-shadow">
                        ซื้อง่าย ขายไว ปลอดภัยทุกการส่งต่อ
                    </p>
                    <p className="mt-2 text-sm sm:text-base text-white/80 max-w-xl mx-auto">
                        Your trusted online marketplace empowering buyers and sellers with speed, convenience, and safety.
                    </p>
                </div>
            </div>

            {/* Core Values */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {values.map((v, i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                                <FiCheckCircle className="w-5 h-5 text-brand-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-base">{v.title}</h3>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{v.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Testimonials */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
                <div className="text-center mb-12">
                    <h2 className="section-title">What Our Community Says</h2>
                    <p className="text-gray-500 mt-1">Real feedback from SongTor Hub users</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {testimonials.map((item, index) => (
                        <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <h3 className="text-base font-bold text-gray-900 mb-2">"{item.headline}"</h3>
                            <p className="text-sm text-gray-600 leading-relaxed mb-6">"{item.quote}"</p>
                            <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                                <img className="rounded-full w-10 h-10 object-cover" src={item.image} alt={item.name} />
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900">{item.name}</h4>
                                    <p className="text-xs text-gray-400">{item.title}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
