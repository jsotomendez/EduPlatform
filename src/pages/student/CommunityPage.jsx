import { useEffect, useState } from 'react';
import { communityService } from '../../services/community.service';
import { useUser } from '../../context/UserContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Avatar } from '../../components/common/Avatar';
import { Skeleton } from '../../components/feedback/Skeleton';
import { formatRelativeDate } from '../../utils/formatters';
import styles from './CommunityPage.module.css';

export function CommunityPage() {
  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [trends, setTrends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', course: '' });

  useEffect(() => {
    setIsLoading(true);
    Promise.all([communityService.getPosts(), communityService.getTrendingTopics()])
      .then(([p, t]) => {
        setPosts(p);
        setTrends(t);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleCreatePost = async () => {
    const created = await communityService.createPost({
      ...newPost,
      authorId: user.id,
      authorName: user.name,
      authorAvatar: null,
    });
    setPosts([created, ...posts]);
    setShowModal(false);
    setNewPost({ title: '', content: '', course: '' });
  };

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Comunidad</h1>
          <p className={styles.subtitle}>Aprende colaborando con tus compañeros</p>
        </div>
        <Button variant="primary" icon="fa-plus" onClick={() => setShowModal(true)}>
          Crear debate
        </Button>
      </header>

      <div className={styles.layout}>
        <main className={styles.feed}>
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} height="180px" borderRadius="xl" />
              ))
            : posts.map((post) => <PostCard key={post.id} post={post} />)}
        </main>

        <aside className={styles.sidebar}>
          <Card padding="md">
            <h3 className={styles.sideTitle}>Tendencias</h3>
            <ul className={styles.trends}>
              {trends.map((t) => (
                <li key={t.tag} className={styles.trend}>
                  <span className={styles.trendHash}>#</span>
                  <span className={styles.trendTag}>{t.tag}</span>
                  <span className={styles.trendCount}>{t.count}</span>
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>

      {/* Modal nuevo debate */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Crear nuevo debate"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleCreatePost}>
              Publicar
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input
            label="Título de tu pregunta o debate"
            value={newPost.title}
            onChange={(e) => setNewPost((p) => ({ ...p, title: e.target.value }))}
            placeholder="Ej: ¿Cómo aplicar las derivadas en la vida real?"
            required
          />
          <div>
            <label
              style={{
                fontSize: 'var(--fs-sm)',
                fontWeight: 'var(--fw-semibold)',
                display: 'block',
                marginBottom: 'var(--space-2)',
              }}
            >
              Contenido
            </label>
            <textarea
              value={newPost.content}
              onChange={(e) => setNewPost((p) => ({ ...p, content: e.target.value }))}
              placeholder="Describe tu pregunta con detalle..."
              rows={4}
              style={{
                width: '100%',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                border: '2px solid var(--color-border)',
                fontSize: 'var(--fs-sm)',
                fontFamily: 'var(--font-body)',
                resize: 'vertical',
                background: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

function PostCard({ post }) {
  const [liked, setLiked] = useState(false);

  return (
    <Card padding="md" className={styles.postCard} hoverable>
      <div className={styles.postHeader}>
        <Avatar name={post.authorName} size="md" />
        <div className={styles.postAuthor}>
          <span className={styles.authorName}>{post.authorName}</span>
          <span className={styles.postMeta}>
            {post.course} · {formatRelativeDate(post.timestamp)}
          </span>
        </div>
        <div className={styles.postBadges}>
          {post.solved && (
            <Badge variant="success" icon="fa-circle-check" size="sm">
              Resuelto
            </Badge>
          )}
          {post.aiResponse && (
            <Badge variant="primary" icon="fa-robot" size="sm">
              Resuelto por IA
            </Badge>
          )}
        </div>
      </div>
      <div className={styles.postBody}>
        <h3 className={styles.postTitle}>{post.title}</h3>
        <p className={styles.postContent}>{post.content}</p>
      </div>
      {post.aiResponse && (
        <div className={styles.aiResponse}>
          <div className={styles.aiResponseHeader}>
            <i className="fa-solid fa-robot" aria-hidden="true" /> Respuesta del Tutor IA
          </div>
          <p className={styles.aiResponseText}>{post.aiResponse.text}</p>
          <span className={styles.aiHelpful}>
            <i className="fa-solid fa-thumbs-up" aria-hidden="true" /> {post.aiResponse.helpful}{' '}
            encontraron esto útil
          </span>
        </div>
      )}
      <div className={styles.postFooter}>
        <button
          className={[styles.actionBtn, liked ? styles.liked : ''].join(' ')}
          onClick={() => setLiked(!liked)}
          aria-pressed={liked}
          aria-label="Me gusta"
        >
          <i className={`fa-${liked ? 'solid' : 'regular'} fa-heart`} aria-hidden="true" />{' '}
          {post.likes + (liked ? 1 : 0)}
        </button>
        <button className={styles.actionBtn} aria-label="Responder">
          <i className="fa-regular fa-comment" aria-hidden="true" /> {post.replies}
        </button>
        {post.tags?.map((tag) => (
          <Badge key={tag} variant="default" size="sm">
            #{tag}
          </Badge>
        ))}
      </div>
    </Card>
  );
}
