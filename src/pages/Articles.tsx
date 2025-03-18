import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { articleData } from './ArticleDetail';

const Articles = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Berita terbaru dari MTT</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Berita terbaru dari majelis telkomsel taqwa
          </p>
        </div>
        <div
          ref={ref}
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-1000 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {articleData?.map((article, index) => (
              <div
                key={index}
                className="bg-white p-0 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className=" overflow-hidden">
                  <img
                    className="w-full h-48 object-cover transition-transform duration-300 hover:scale-125 hover:shadow-xl"
                    src={article.image}
                  ></img>
                </div>
                <div className="relative p-4 min-h-[330px]">
                  <h3 className="text-[18px] font-bold text-gray-900 mb-4">
                    {article.title}
                  </h3>
                  <div
                    className="mt-4 text-[16px] text-gray-700 leading-relaxed line-clamp-4"
                    dangerouslySetInnerHTML={{ __html: article.news }}
                  />
                  <div className="absolute bottom-0 flex flex-row w-[95%] justify-between items-center mt-2 py-4 pr-4">
                    <div className="flex flex-row items-center">
                      <Calendar  width={14} className="text-gray-600 mr-1"/>
                      <h2 className="text-[16px] text-gray-600 leading-relaxed line-clamp-4">{article?.created}</h2>
                    </div>
                    <Link
                      to={`/articles/${article.id}`}
                      className="inline-flex items-center bg-tertiary1 text-white px-8 py-3 rounded-full font-semibold transition-colors"
                    >
                      Selengkapnya
                    </Link>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Articles;