import { useEffect, useState } from 'react';
import { courseService } from '../../services/course.service';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/feedback/Skeleton';
import { useNotifications } from '../../context/NotificationContext';
import styles from './TeacherCoursesPage.module.css';

export function TeacherCoursesPage() {
  const { addToast } = useNotifications();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' | 'route'

  // Curso seleccionado para ver/editar su ruta de trabajo
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);

  // Modales
  const [editingCourse, setEditingCourse] = useState(null);
  const [newModuleName, setNewModuleName] = useState('');
  const [isAddingModule, setIsAddingModule] = useState(false);

  // Modal para agregar lección
  const [addingLessonToModule, setAddingLessonToModule] = useState(null); // module object
  const [newLessonData, setNewLessonData] = useState({ title: '', description: '' });

  // Cargar cursos
  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const data = await courseService.getCourses();
      setCourses(data);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', message: 'Error al cargar los cursos.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleSelectCourse = async (course) => {
    setSelectedCourse(course);
    setIsLoadingLessons(true);
    try {
      const courseLessons = await courseService.getLessonsByCourse(course.id);
      setLessons(courseLessons);
      setView('route');
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', message: 'Error al cargar las lecciones.' });
    } finally {
      setIsLoadingLessons(false);
    }
  };

  // Guardar cambios del curso (metadata)
  const handleSaveCourseMetadata = async (e) => {
    e.preventDefault();
    if (!editingCourse) return;
    try {
      const updated = await courseService.updateCourse(editingCourse);
      setCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      if (selectedCourse?.id === updated.id) {
        setSelectedCourse(updated);
      }
      addToast({ type: 'success', message: 'Información del curso actualizada.' });
      setEditingCourse(null);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', message: 'Error al actualizar el curso.' });
    }
  };

  // Crear módulo
  const handleCreateModule = async (e) => {
    e.preventDefault();
    if (!newModuleName.trim() || !selectedCourse) return;
    try {
      const updatedCourse = await courseService.createModule(selectedCourse.id, newModuleName);
      setCourses((prev) => prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c)));
      setSelectedCourse(updatedCourse);
      addToast({ type: 'success', message: `Módulo "${newModuleName}" creado.` });
      setNewModuleName('');
      setIsAddingModule(false);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', message: 'Error al crear el módulo.' });
    }
  };

  // Crear lección
  const handleCreateLesson = async (e) => {
    e.preventDefault();
    if (!newLessonData.title.trim() || !newLessonData.description.trim() || !addingLessonToModule)
      return;
    try {
      const { course: updatedCourse, lesson: newLesson } = await courseService.createLesson(
        selectedCourse.id,
        addingLessonToModule.id,
        newLessonData
      );

      // Actualizar estados
      setCourses((prev) => prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c)));
      setSelectedCourse(updatedCourse);
      setLessons((prev) => [...prev, newLesson]);

      addToast({ type: 'success', message: `Lección "${newLessonData.title}" agregada.` });
      setNewLessonData({ title: '', description: '' });
      setAddingLessonToModule(null);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', message: 'Error al crear la lección.' });
    }
  };

  return (
    <div className={styles.page}>
      {view === 'list' ? (
        <>
          <header className={styles.pageHeader}>
            <div>
              <h1 className={styles.title}>Mis Cursos</h1>
              <p className={styles.subtitle}>Gestiona tus materias y las rutas de tus alumnos</p>
            </div>
          </header>

          <div className={styles.courseGrid}>
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} height="220px" borderRadius="xl" />
                ))
              : courses.map((course) => (
                  <Card key={course.id} padding="lg" className={styles.courseCard}>
                    <div className={styles.cardTop}>
                      <div
                        className={styles.courseIcon}
                        style={{
                          background: `${course.color || 'var(--color-brand-primary)'}15`,
                          color: course.color || 'var(--color-brand-primary)',
                        }}
                      >
                        <i className={`fa-solid ${course.icon || 'fa-book'}`} />
                      </div>
                      <Badge variant="default" size="sm">
                        {course.enrolled || 0} alumnos
                      </Badge>
                    </div>
                    <div className={styles.cardBody}>
                      <h3 className={styles.courseTitle}>{course.title}</h3>
                      <p className={styles.courseDesc}>{course.description}</p>
                      <div className={styles.metaRow}>
                        <span className={styles.metaLabel}>Instructor:</span>
                        <span className={styles.metaVal}>{course.instructor}</span>
                      </div>
                      <div className={styles.metaRow}>
                        <span className={styles.metaLabel}>Módulos:</span>
                        <span className={styles.metaVal}>{course.modules?.length || 0}</span>
                      </div>
                    </div>
                    <div className={styles.cardActions}>
                      <Button
                        variant="ghost"
                        icon="fa-pen-to-square"
                        size="sm"
                        onClick={() => setEditingCourse({ ...course })}
                      >
                        Editar Datos
                      </Button>
                      <Button
                        variant="primary"
                        icon="fa-route"
                        size="sm"
                        onClick={() => handleSelectCourse(course)}
                      >
                        Gestionar Ruta
                      </Button>
                    </div>
                  </Card>
                ))}
          </div>
        </>
      ) : (
        // Vista de Ruta de Trabajo
        selectedCourse && (
          <div className={styles.routeContainer}>
            <header className={styles.routeHeader}>
              <Button
                variant="ghost"
                icon="fa-arrow-left"
                size="sm"
                onClick={() => setView('list')}
              >
                Volver a Cursos
              </Button>
              <div className={styles.routeHeaderTitleRow}>
                <div
                  className={styles.routeIcon}
                  style={{
                    background: `${selectedCourse.color}15`,
                    color: selectedCourse.color,
                  }}
                >
                  <i className={`fa-solid ${selectedCourse.icon}`} />
                </div>
                <div>
                  <h1 className={styles.title}>{selectedCourse.title}</h1>
                  <p className={styles.subtitle}>Secuenciación de Ruta de Trabajo (Módulos)</p>
                </div>
              </div>
            </header>

            <div className={styles.routeLayout}>
              <div className={styles.modulesTimeline}>
                <div className={styles.timelineHeader}>
                  <h2 className={styles.sectionTitle}>Estructura de la Ruta</h2>
                  <Button
                    variant="primary"
                    icon="fa-plus"
                    size="sm"
                    onClick={() => setIsAddingModule(true)}
                  >
                    Nuevo Módulo
                  </Button>
                </div>

                {isLoadingLessons ? (
                  <Skeleton height="300px" />
                ) : selectedCourse.modules?.length === 0 ? (
                  <Card className={styles.emptyCard} padding="lg">
                    <i className="fa-solid fa-route" />
                    <p>Aún no has creado ningún módulo en esta ruta.</p>
                  </Card>
                ) : (
                  <div className={styles.modulesList}>
                    {selectedCourse.modules.map((mod, index) => {
                      const modLessons = lessons.filter((l) => mod.lessons?.includes(l.id));
                      return (
                        <div key={mod.id} className={styles.timelineNode}>
                          <div className={styles.nodeLeft}>
                            <div className={styles.nodeBadge}>{index + 1}</div>
                            {index < selectedCourse.modules.length - 1 && (
                              <div className={styles.nodeLine} />
                            )}
                          </div>
                          <div className={styles.nodeRight}>
                            <Card className={styles.moduleCard} padding="md">
                              <div className={styles.moduleCardHeader}>
                                <div>
                                  <h4 className={styles.moduleTitle}>{mod.title}</h4>
                                  {mod.description && (
                                    <p className={styles.moduleDesc}>{mod.description}</p>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  icon="fa-plus"
                                  size="sm"
                                  onClick={() => setAddingLessonToModule(mod)}
                                >
                                  Añadir Lección
                                </Button>
                              </div>

                              {modLessons.length === 0 ? (
                                <p className={styles.emptyLessonsText}>
                                  No hay lecciones en este módulo. Agrega una para empezar.
                                </p>
                              ) : (
                                <ul className={styles.lessonsList}>
                                  {modLessons.map((les) => (
                                    <li key={les.id} className={styles.lessonItem}>
                                      <div className={styles.lessonItemContent}>
                                        <span className={styles.lessonNum}>
                                          <i className="fa-solid fa-file-lines" />
                                        </span>
                                        <div>
                                          <p className={styles.lessonTitle}>{les.title}</p>
                                          <p className={styles.lessonDesc}>{les.description}</p>
                                        </div>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </Card>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      )}

      {/* Modal para editar información general del curso */}
      {editingCourse && (
        <Modal
          isOpen={!!editingCourse}
          onClose={() => setEditingCourse(null)}
          title="Editar Datos del Curso"
          size="md"
        >
          <form onSubmit={handleSaveCourseMetadata} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="edit-title" className={styles.formLabel}>
                Título del Curso
              </label>
              <input
                id="edit-title"
                type="text"
                value={editingCourse.title}
                onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                className={styles.formInput}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="edit-desc" className={styles.formLabel}>
                Descripción
              </label>
              <textarea
                id="edit-desc"
                value={editingCourse.description}
                onChange={(e) =>
                  setEditingCourse({ ...editingCourse, description: e.target.value })
                }
                className={styles.formTextarea}
                rows={4}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="edit-instructor" className={styles.formLabel}>
                Nombre del Instructor
              </label>
              <input
                id="edit-instructor"
                type="text"
                value={editingCourse.instructor}
                onChange={(e) => setEditingCourse({ ...editingCourse, instructor: e.target.value })}
                className={styles.formInput}
                required
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="edit-color" className={styles.formLabel}>
                  Color Identificador (Hex)
                </label>
                <input
                  id="edit-color"
                  type="color"
                  value={editingCourse.color || '#4f46e5'}
                  onChange={(e) => setEditingCourse({ ...editingCourse, color: e.target.value })}
                  className={styles.formInputColor}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="edit-icon" className={styles.formLabel}>
                  Ícono FontAwesome
                </label>
                <select
                  id="edit-icon"
                  value={editingCourse.icon || 'fa-book'}
                  onChange={(e) => setEditingCourse({ ...editingCourse, icon: e.target.value })}
                  className={styles.formSelect}
                >
                  <option value="fa-calculator">Calculadora (Matemáticas)</option>
                  <option value="fa-code">Código (Programación)</option>
                  <option value="fa-leaf">Hoja (Sostenibilidad)</option>
                  <option value="fa-comments">Comentarios (Comunicación)</option>
                  <option value="fa-infinity">Infinito (Cálculo)</option>
                  <option value="fa-recycle">Reciclaje (Ecológico)</option>
                  <option value="fa-book">Libro (Genérico)</option>
                </select>
              </div>
            </div>

            <div className={styles.formActions}>
              <Button variant="ghost" type="button" onClick={() => setEditingCourse(null)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" icon="fa-floppy-disk">
                Guardar Cambios
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal para agregar un nuevo módulo */}
      {isAddingModule && (
        <Modal
          isOpen={isAddingModule}
          onClose={() => setIsAddingModule(false)}
          title="Agregar Nuevo Módulo"
          size="sm"
        >
          <form onSubmit={handleCreateModule} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="new-mod-name" className={styles.formLabel}>
                Título del Módulo
              </label>
              <input
                id="new-mod-name"
                type="text"
                placeholder="Ej: Módulo 4: Integral Definida"
                value={newModuleName}
                onChange={(e) => setNewModuleName(e.target.value)}
                className={styles.formInput}
                required
                autoFocus
              />
            </div>

            <div className={styles.formActions}>
              <Button variant="ghost" type="button" onClick={() => setIsAddingModule(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" icon="fa-plus">
                Crear Módulo
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal para agregar una nueva lección */}
      {addingLessonToModule && (
        <Modal
          isOpen={!!addingLessonToModule}
          onClose={() => setAddingLessonToModule(null)}
          title={`Agregar Lección a: ${addingLessonToModule.title}`}
          size="md"
        >
          <form onSubmit={handleCreateLesson} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="new-les-title" className={styles.formLabel}>
                Título de la Lección
              </label>
              <input
                id="new-les-title"
                type="text"
                placeholder="Ej: Introducción a Límites Horizontales"
                value={newLessonData.title}
                onChange={(e) => setNewLessonData({ ...newLessonData, title: e.target.value })}
                className={styles.formInput}
                required
                autoFocus
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="new-les-desc" className={styles.formLabel}>
                Descripción de la Lección
              </label>
              <textarea
                id="new-les-desc"
                placeholder="Describe brevemente el contenido de esta lección para orientar a los alumnos."
                value={newLessonData.description}
                onChange={(e) =>
                  setNewLessonData({ ...newLessonData, description: e.target.value })
                }
                className={styles.formTextarea}
                rows={3}
                required
              />
            </div>

            <div className={styles.formActions}>
              <Button variant="ghost" type="button" onClick={() => setAddingLessonToModule(null)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" icon="fa-plus">
                Agregar Lección
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
