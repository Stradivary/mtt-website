import React, { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  body: string;
  userId: number;
}

const Articles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        const data = await response.json();
        setArticles(data.slice(0, 9));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching articles:', error);
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading articles...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Latest Articles</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover insights and updates from our team of experts
          </p>
        </div>
        <div
          ref={ref}
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-1000 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div
                className="h-48 bg-cover bg-center"
                style={{
                  backgroundImage: `url(https://images.unsplash.com/photo-${1500000000000 + article.id}?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80)`,
                }}
              />
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2">
                  {article.title}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-3">{article.body}</p>
                <Link
                  to={`/articles/${article.id}`}
                  className="inline-flex items-center text-[#00B14F] font-semibold hover:text-[#009E47] transition-colors"
                >
                  Read More
                  <ArrowRight className="ml-2" size={20} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Articles;