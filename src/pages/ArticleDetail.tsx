import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  body: string;
  userId: number;
}

const ArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
        const data = await response.json();
        setArticle(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching article:', error);
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading article...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Article not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/articles"
          className="inline-flex items-center text-[#00B14F] font-semibold mb-8 hover:text-[#009E47] transition-colors"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to Articles
        </Link>
        
        <div
          className="h-[400px] w-full bg-cover bg-center rounded-2xl mb-8"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-${1500000000000 + article.id}?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80)`,
          }}
        />

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            {article.title}
          </h1>
          
          <div className="prose max-w-none">
            <p className="text-gray-600 text-lg leading-relaxed">
              {article.body}
            </p>
            {/* Adding more mock content since the API provides limited content */}
            <p className="text-gray-600 text-lg leading-relaxed mt-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed mt-4">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </div>
        </div>
      </article>
    </div>
  );
};

export default ArticleDetail;