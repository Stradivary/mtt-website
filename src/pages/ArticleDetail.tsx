import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface Article {
  id: string;
  image: string;
  title: string;
  news: string;
  created: string;
}

export const articleData: Article[] = [
  {
    id: "1",
    image: "/assets/images/articles/article1.png",
    title:
      "Semarak Ramadhan 1446 H, MTT Sumbagsel Distribusikan 50 Paket Sembako untuk Warga Pra Sejahtera di Palembang",
    news: `
    PALEMBANG– Majelis Telkomsel Taqwa (MTT) Sumatera Bagian Selatan (Sumbagsel) kembali menggelar program berbagi Paket Ramadhan kepada warga pra-sejahtera di sekitar Kantor Telkomsel Smart Office (TSO) Sriwijaya Palembang. Program ini bekerja sama dengan Inisiatif Zakat Indonesia (IZI) Sumatera Selatan (Sumsel), dengan total 50 paket sembako disalurkan kepada penerima manfaat di Masjid TSO Sriwijaya Darussalam Palembang, Rabu sore, (12/03/2025).<br/>
    Kegiatan ini merupakan bagian dari penyaluran zakat karyawan Telkomsel yang bertujuan untuk meringankan beban keluarga pra sejahtera selama bulan Ramadhan. Dengan pembagian sembako, diharapkan dapat memenuhi kebutuhan pokok keluarga yang membutuhkan selama bulan suci ini.<br/>
    Perwakilan manajemen Telkomsel Sumbagsel, Riki Irawan, didampingi oleh Ketua MTT Sumbagsel, Benny Syahputra, menyerahkan paket sembako secara simbolis kepada penerima manfaat. Turut hadir pula perwakilan IZI Sumsel dan Ustadz Fahmi yang memberikan tausiyah kepada jamaah.<br/>
    Dalam sambutannya, Riki Irawan mengungkapkan pentingnya doa dari masyarakat untuk keberkahan bersama. “Telkomsel besar berkat dukungan pelanggan kami yang setia. Apa yang telah kami terima, kami kembalikan lagi kepada masyarakat melalui program-program seperti ini. Kami juga memohon doa dari Bapak dan Ibu semua, semoga kita semua diberi keberkahan,” Ujar Riki.<br/>
    Salah satu penerima manfaat, Rosida (52), menyampaikan rasa terima kasihnya kepada para donatur. “Kami ucapkan terima kasih kepada seluruh donatur yang telah memberikan paket sembako ini. Ini sangat bermanfaat untuk keluarga kami, semoga Allah mengabulkan hajat para donatur,” Ungkapnya.<br/>
    Acara ini semakin hangat dengan tausiyah yang disampaikan oleh Ustadz Fahmi yang mengingatkan jamaah akan pentingnya sedekah dan membaca Al-Qur’an selama bulan Ramadhan. Rangakaian acara ini kemudian ditutup dengan doa bersama dan sesi foto penyerahan paket sembako.
    Melalui program ini, MTT Sumbagsel berharap dapat terus memberikan manfaat bagi masyarakat sekitar dan mempererat hubungan antara Telkomsel dan pelanggan serta komunitas setempat.
    `,
    created: "09:00, 18/03/2025",
  },
  {
    id: "2",
    image: "/assets/images/articles/article2.png",
    title:
      "MTT Sulawesi dan IZI Sulses Luncurkan Program Lapak Berkah untuk Pelaku Usaha Kecil di Kabupaten Bone",
    news: `BONE– Majelis Telkomsel Taqwa (MTT) Sulawesi bersama Inisiatif Zakat Indonesia (IZI) Sulawesi Selatan (Sulsel) meluncurkan Program Lapak Berkah di Kabupaten Bone, Rabu, (26/02/2025). Program ini bertujuan untuk membantu lima pelaku usaha kecil dengan memberikan dukungan modal dan fasilitas usaha guna meningkatkan kemandirian ekonomi mereka.<br/>
    Bantuan yang diberikan kepada para penerima manfaat mencakup tenda baazar, peralatan masak, serta bahan dagangan yang sesuai dengan jenis usaha masing-masing. Selain itu, penerima manfaat juga akan mendapatkan bimbingan usaha untuk mengelola bisnis mereka dengan lebih baik. Penyerahan bantuan dilakukan secara simbolis di lokasi usaha masing-masing pada acara yang dihadiri oleh Branch Manager Telkomsel Bone, Andi Adi Senopati Temmattumpa; General Manager MI IZI, Arman; dan Kepala Cabang IZI Sulsel, Eko Mulyono.<br/>
    Dalam sambutannya, Andi menyampaikan harapannya agar bantuan yang diberikan dapat memberikan manfaat besar bagi penerima manfaat. “Semoga bantuan ini dapat membantu para pelaku usaha untuk meningkatkan ekonomi keluarga, mendukung pendidikan anak-anak, dan membawa keberkahan bagi semua pihak,” Ujar Andi.<br/>
    Sementara itu, Arman menekankan pentingnya bagi para pelaku usaha untuk memanfaatkan bantuan tersebut dengan sebaik-baiknya. "Kami berharap program ini dapat membantu mereka lebih mandiri, dan kelak bisa berbagi dengan sesama. IZI akan terus mendampingi mereka agar usaha semakin berkembang,” Katanya.<br/>
    Salah satu penerima manfaat, Ibu Yuyun, menyampaikan rasa syukurnya atas bantuan yang diterima. “Alhamdulillah, terima kasih kepada MTT dan IZI. Semoga usaha kami semakin maju dan bermanfaat bagi keluarga,” Uajar Ibu Yuyun dengan penuh rasa syukur.<br/>
    Program Lapak Berkah ini merupakan wujud kepedulian MTT Sulawesi dan IZI Sulsel dalam mendukung perekonomian masyarakat. Diharapkan, program ini dapat menginspirasi lebih banyak pelaku usaha kecil di daerah untuk terus berkembang dan mencapai kemandirian ekonomi.`,
    created: "09:00, 17/03/2025",
  },
  {
    id: "3",
    image: "/assets/images/articles/article3.png",
    title:
      "MTT Jatim dan Telkomsel Berkolaborasi Sediakan Menu Buka Puasa untuk Karyawan",
    news: `SURABAYA-  Menyemarakkan Bulan suci Ramadhan, Majelis Telkomsel Taqwa (MTT) Jawa Timur bekerja sama dengan Telkomsel terus menghadirkan program berbuka puasa bersama bagi karyawan di area kantor Telkomsel, termasuk karyawan organik, outsourcing, dan vendor. Program ini menggunakan dana yang diambil dari dana sedekah yang dihimpun MTT Jatim  dan dana dari Corporate Social Responsibility (CSR) Telkomsel. <br/>
    Buka puasa bersama ini tidak hanya menjadi momen berbagi hidangan, tetapi juga dilanjutkan dengan ibadah sholat maghrib dan tarawih berjemaah di Masjid Al-Wasathyah, Telkom Landmark Tower, Surabaya. Kegiatan ini diadakan setiap hari sepanjang Ramadhan, memberikan kesempatan bagi para karyawan untuk mempererat tali silaturahmi dan meningkatkan ibadah di bulan penuh berkah ini.<br/>
    Taufiq, seorang satpam Telkomsel, mengungkapkan rasa terima kasihnya atas inisiatif tersebut. “Alhamdulillah, Terima Kasih kepada MTT Jatim dan Telkomsel yang telah menyediakan hidangan Ifthar atau Buka Puasa. Kami sebagai satpam dan outsourcing sangat terbantu oleh adanya program Ifthar MTT ini. Jadi kami tidak perlu membeli keluar untuk berbuka puasa. Terima Kasih MTT dan Telkomsel,” Tuturnya saat ditemui usai berbuka puasa di Masjid Al-Wasathyah, Telkom Landmark Tower, Surabaya, Selasa, (11/03/2025).<br/>
    Hingga hari ke-11 Ramadhan 1446 H, MTT Jatim dan Telkomsel telah berhasil menyediakan sekitar 320 hidangan Ifthar dan Takjil untuk karyawan, memberikan manfaat langsung kepada mereka yang bekerja di perusahaan telekomunikasi terbesar di Indonesia ini. Program ini menjadi wujud nyata kepedulian sosial MTT dan Telkomsel dalam memperhatikan  kesejahteraan karyawannya, sekaligus menjadi bagian dari keberkahan bulan Ramadhan.`,
    created: "09:30, 17/03/2025",
  },
  {
    id: "4",
    image: "/assets/images/articles/article4.png",
    title:
      "Semarak Ramadhan 1446 H, MTT Sumbagsel Distribusikan 50 Paket Sembako untuk Warga Pra Sejahtera di Palembang",
    news: `PALEMBANG– Majelis Telkomsel Taqwa (MTT) Sumatera Bagian Selatan (Sumbagsel) kembali menggelar program berbagi Paket Ramadhan kepada warga pra-sejahtera di sekitar Kantor Telkomsel Smart Office (TSO) Sriwijaya Palembang. Program ini bekerja sama dengan Inisiatif Zakat Indonesia (IZI) Sumatera Selatan (Sumsel), dengan total 50 paket sembako disalurkan kepada penerima manfaat di Masjid TSO Sriwijaya Darussalam Palembang, Rabu sore, (12/03/2025).<br/>
    Kegiatan ini merupakan bagian dari penyaluran zakat karyawan Telkomsel yang bertujuan untuk meringankan beban keluarga pra sejahtera selama bulan Ramadhan. Dengan pembagian sembako, diharapkan dapat memenuhi kebutuhan pokok keluarga yang membutuhkan selama bulan suci ini.<br/>
    Perwakilan manajemen Telkomsel Sumbagsel, Riki Irawan, didampingi oleh Ketua MTT Sumbagsel, Benny Syahputra, menyerahkan paket sembako secara simbolis kepada penerima manfaat. Turut hadir pula perwakilan IZI Sumsel dan Ustadz Fahmi yang memberikan tausiyah kepada jamaah.
    Dalam sambutannya, Riki Irawan mengungkapkan pentingnya doa dari masyarakat untuk keberkahan bersama. “Telkomsel besar berkat dukungan pelanggan kami yang setia. Apa yang telah kami terima, kami kembalikan lagi kepada masyarakat melalui program-program seperti ini. Kami juga memohon doa dari Bapak dan Ibu semua, semoga kita semua diberi keberkahan,” Ujar Riki.<br/>
    Salah satu penerima manfaat, Rosida (52), menyampaikan rasa terima kasihnya kepada para donatur. “Kami ucapkan terima kasih kepada seluruh donatur yang telah memberikan paket sembako ini. Ini sangat bermanfaat untuk keluarga kami, semoga Allah mengabulkan hajat para donatur,” Ungkapnya.<br/>
    Acara ini semakin hangat dengan tausiyah yang disampaikan oleh Ustadz Fahmi yang mengingatkan jamaah akan pentingnya sedekah dan membaca Al-Qur’an selama bulan Ramadhan. Rangakaian acara ini kemudian ditutup dengan doa bersama dan sesi foto penyerahan paket sembako.
    Melalui program ini, MTT Sumbagsel berharap dapat terus memberikan manfaat bagi masyarakat sekitar dan mempererat hubungan antara Telkomsel dan pelanggan serta komunitas setempat.`,
    created: "10:00, 16/03/2025",
  },
  {
    id: "5",
    image: "/assets/images/articles/article5.png",
    title:
      "Semarak Ramadhan 1446 H, MTT Sumbagsel Distribusikan 50 Paket Sembako untuk Warga Pra Sejahtera di Palembang",
    news: `PALEMBANG– Majelis Telkomsel Taqwa (MTT) Sumatera Bagian Selatan (Sumbagsel) kembali menggelar program berbagi Paket Ramadhan kepada warga pra-sejahtera di sekitar Kantor Telkomsel Smart Office (TSO) Sriwijaya Palembang. Program ini bekerja sama dengan Inisiatif Zakat Indonesia (IZI) Sumatera Selatan (Sumsel), dengan total 50 paket sembako disalurkan kepada penerima manfaat di Masjid TSO Sriwijaya Darussalam Palembang, Rabu sore, (12/03/2025).<br/>
    Kegiatan ini merupakan bagian dari penyaluran zakat karyawan Telkomsel yang bertujuan untuk meringankan beban keluarga pra sejahtera selama bulan Ramadhan. Dengan pembagian sembako, diharapkan dapat memenuhi kebutuhan pokok keluarga yang membutuhkan selama bulan suci ini.<br/>
    Perwakilan manajemen Telkomsel Sumbagsel, Riki Irawan, didampingi oleh Ketua MTT Sumbagsel, Benny Syahputra, menyerahkan paket sembako secara simbolis kepada penerima manfaat. Turut hadir pula perwakilan IZI Sumsel dan Ustadz Fahmi yang memberikan tausiyah kepada jamaah.<br/>
    Dalam sambutannya, Riki Irawan mengungkapkan pentingnya doa dari masyarakat untuk keberkahan bersama. “Telkomsel besar berkat dukungan pelanggan kami yang setia. Apa yang telah kami terima, kami kembalikan lagi kepada masyarakat melalui program-program seperti ini. Kami juga memohon doa dari Bapak dan Ibu semua, semoga kita semua diberi keberkahan,” Ujar Riki.<br/>
    Salah satu penerima manfaat, Rosida (52), menyampaikan rasa terima kasihnya kepada para donatur. “Kami ucapkan terima kasih kepada seluruh donatur yang telah memberikan paket sembako ini. Ini sangat bermanfaat untuk keluarga kami, semoga Allah mengabulkan hajat para donatur,” Ungkapnya.<br/>
    Acara ini semakin hangat dengan tausiyah yang disampaikan oleh Ustadz Fahmi yang mengingatkan jamaah akan pentingnya sedekah dan membaca Al-Qur’an selama bulan Ramadhan. Rangakaian acara ini kemudian ditutup dengan doa bersama dan sesi foto penyerahan paket sembako.<br/>
    Melalui program ini, MTT Sumbagsel berharap dapat terus memberikan manfaat bagi masyarakat sekitar dan mempererat hubungan antara Telkomsel dan pelanggan serta komunitas setempat.`,
    created: "11:00, 15/03/2025",
  },
];

const ArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState<Article>();

  useEffect(() => {
    const data = articleData.find((item) => item?.id === id);
    console.log("data", data);
    setArticle(data);
  }, [id]);

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
          className="inline-flex items-center text-primary font-semibold mb-8 hover:text-[#009E47] transition-colors"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to Articles
        </Link>

        <img
          className="h-[400px] w-full bg-cover bg-center rounded-2xl mb-8"
          src={article.image}
        />

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            {article.title}
          </h1>
          <div
            className="mt-4 text-[16px] text-gray-600 text-lg leading-relaxed text-justify"
            dangerouslySetInnerHTML={{ __html: article.news }}
          />
        </div>
      </article>
    </div>
  );
};

export default ArticleDetail;
