import React, {useState, useEffect} from 'react';
import {useAuth} from '../context/AuthContext';
import NotFound from './NotFound';
import config from '../../config';
import {
    Tabs,
    Table,
    Button,
    Modal,
    Form,
    Input,
    InputNumber,
    DatePicker,
    Select,
    Upload,
    Card,
    Row,
    Col,
    Statistic,
    Space,
    message,
    Popconfirm,
    Tag,
    Switch, Menu
} from 'antd';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import {
    UploadOutlined,
    UserOutlined,
    ShoppingCartOutlined,
    DollarOutlined,
    ProductOutlined,
    CalculatorFilled,
    PlusOutlined,
    HeatMapOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined
} from '@ant-design/icons';
import Login from './Login';
import Layout from 'antd/es/layout/layout';
import dayjs from 'dayjs';
const {TabPane} = Tabs;
const {Option} = Select;
const {TextArea} = Input;

function Admin() {
    const {user, isAuthenticated} = useAuth();
    
    if (!isAuthenticated || !user)
        return <Login/>;
    if (user.role !== 4) {
        return <NotFound/>;
    }


    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem('admin_active_tab') || '1';
    });
    const [loading, setLoading] = useState(false);

    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [userStats, setUserStats] = useState({
        today: 0,
        week: 0,
        month: 0,
        year: 0
    });

    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [orderStats, setOrderStats] = useState({
        today: 0,
        week: 0,
        month: 0,
        year: 0
    });

    const [payments, setPayments] = useState([]);
    const [paymentsLoading, setPaymentsLoading] = useState(false);
    const [paymentStats, setPaymentStats] = useState({
        today: 0,
        week: 0,
        month: 0,
        year: 0
    });

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [addresses, setAddresses] = useState([]);

    const [productsLoading, setProductsLoading] = useState(false);
    const [productStats, setProductStats] = useState({
        today: 0,
        week: 0,
        month: 0,
        year: 0
    });

    // Модальные окна
    const [addProductModal, setAddProductModal] = useState(false);
    const [editProductModal, setEditProductModal] = useState(false);
    const [addCategoryModal, setAddCategoryModal] = useState(false);
    const [editCategoryModal, setEditCategoryModal] = useState(false);

    // Пользователи: модалки и формы
    const [addUserModal, setAddUserModal] = useState(false);
    const [editUserModal, setEditUserModal] = useState(false);
    const [userForm] = Form.useForm();
    const [editUserForm] = Form.useForm();

    // Формы
    const [productForm] = Form.useForm();
    const [editProductForm] = Form.useForm();
    const [categoryForm] = Form.useForm();
    const [editCategoryForm] = Form.useForm();
    const [editingUser, setEditingUser] = useState(null);

    // Загрузка фото
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [photoUrl, setPhotoUrl] = useState('');
    const [editingPhotoUrl, setEditingPhotoUrl] = useState('');

    // Выбранные элементы для редактирования
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);

    const [detailModal, setDetailModal] = useState(false);
    const [detailData, setDetailData] = useState(null);
    const [detailType, setDetailType] = useState('');

    // Загрузка данных при смене вкладки
    useEffect(() => {
        if (activeTab === '1') {
            fetchUsers();
        }
        if (activeTab === '2') {
            fetchOrders();
        }
        if (activeTab === '3') {
            fetchPayments();
        }
        if (activeTab === '4') {
            fetchProducts();
            // Загружаем категории для выпадающего списка
            if (categories.length === 0) {
                fetchCategories();
            }
        }
        if (activeTab === "5") {
            fetchCategories();
        }
        if (activeTab === "6") {
            fetchAddresses();
        }
        localStorage.setItem('admin_active_tab', activeTab);
    }, [activeTab]);




    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const response = await fetch(config.API_URL + "/api/users", {credentials: "include"});
            const data = await response.json();
            setUsers(data);

            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

            const stats = {
                today: data.filter(u => new Date(u.created_at) >= today).length,
                week: data.filter(u => new Date(u.created_at) >= weekAgo).length,
                month: data.filter(u => new Date(u.created_at) >= monthAgo).length,
                year: data.filter(u => new Date(u.created_at) >= yearAgo).length
            };

            setUserStats(stats);
        } catch (error) {
            message.error('Ошибка при загрузке пользователей');
        } finally {
            setUsersLoading(false);
        }
    };

    const handleAddUser = async (values) => {
        try {
            const response = await fetch(config.API_URL + "/api/users", {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(values),
                credentials: "include"
            });
            if (response.ok) {
                message.success('Пользователь добавлен');
                setAddUserModal(false);
                userForm.resetFields();
                fetchUsers();
            } else {
                const err = await response.json();
                message.error(err.detail || 'Ошибка добавления пользователя');
            }
        } catch (e) {
            message.error('Ошибка добавления пользователя');
        }
    };

    const handleEditUser = async (values) => {
        try {
            const payload = {
                ...values,
                birthday: values.birthday
                    ? values.birthday.format('YYYY-MM-DD')
                    : null,
            };
            const response = await fetch(config.API_URL + `/api/users/${editingUser.id}`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
                credentials: "include"
            });
            if (response.ok) {
                message.success('Пользователь обновлён');
                setEditUserModal(false);
                setEditingUser(null);
                editUserForm.resetFields();
                fetchUsers();
            } else {
                const err = await response.json();
                message.error(err.detail || 'Ошибка обновления пользователя');
            }
        } catch (e) {
            message.error('Ошибка обновления пользователя');
        }
    };

    const handleDeleteUser = async (id) => {
        try {
            const response = await fetch(config.API_URL + `/api/users/${id}`, {
                method: 'DELETE',
                credentials: "include"
            });
            if (response.ok) {
                message.success('Пользователь удалён');
                fetchUsers();
            } else {
                message.error('Ошибка удаления пользователя');
            }
        } catch (e) {
            message.error('Ошибка удаления пользователя');
        }
    };

    const openEditUserModal = (user) => {
        setEditingUser(user);

        editUserForm.setFieldsValue({
            ...user,
            birthday: user.birthday ? dayjs(user.birthday) : null,
        });

        setEditUserModal(true);
    };

    const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
            const response = await fetch(config.API_URL + "/api/orders", {credentials: "include"});
            const data = await response.json();
            setOrders(data);

            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

            const stats = {
                today: data.filter(o => new Date(o.created_at) >= today).length,
                week: data.filter(o => new Date(o.created_at) >= weekAgo).length,
                month: data.filter(o => new Date(o.created_at) >= monthAgo).length,
                year: data.filter(o => new Date(o.created_at) >= yearAgo).length
            };

            setOrderStats(stats);
        } catch (error) {
            message.error('Ошибка при загрузке заказов');
        } finally {
            setOrdersLoading(false);
        }
    };

    const fetchPayments = async () => {
        setPaymentsLoading(true);
        try {
            const response = await fetch(config.API_URL + "/api/payments", {credentials: "include"});
            const data = await response.json();
            setPayments(data);

            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

            const stats = {
                today: data.filter(p => new Date(p.created_at) >= today).length,
                week: data.filter(p => new Date(p.created_at) >= weekAgo).length,
                month: data.filter(p => new Date(p.created_at) >= monthAgo).length,
                year: data.filter(p => new Date(p.created_at) >= yearAgo).length
            };

            setPaymentStats(stats);
        } catch (error) {
            message.error('Ошибка при загрузке платежей');
        } finally {
            setPaymentsLoading(false);
        }
    };

    const fetchCategories = async () => {
        setProductsLoading(true);
        try {
            const response = await fetch(config.API_URL + "/api/categories", {
                credentials: "include"
            });
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            message.error('Ошибка при загрузке категорий');
        } finally {
            setProductsLoading(false);
        }
    };

    const fetchProducts = async () => {
        setProductsLoading(true);
        try {
            const response = await fetch(config.API_URL + "/api/products", {
                credentials: "include"
            });
            const data = await response.json();
            setProducts(data);

            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

            const stats = {
                today: data.filter(p => new Date(p.created_at) >= today).length,
                week: data.filter(p => new Date(p.created_at) >= weekAgo).length,
                month: data.filter(p => new Date(p.created_at) >= monthAgo).length,
                year: data.filter(p => new Date(p.created_at) >= yearAgo).length
            };

            setProductStats(stats);
        } catch (error) {
            message.error('Ошибка при загрузке продуктов');
        } finally {
            setProductsLoading(false);
        }
    };

    const fetchAddresses = async () => {
        setProductsLoading(true);
        try {
            const response = await fetch(config.API_URL + "/api/addresses/all", {
                credentials: "include"
            });
            const data = await response.json();
            setAddresses(data);
        } catch (error) {
            message.error('Ошибка при загрузке адресов');
        } finally {
            setProductsLoading(false);
        }
    };

    // Функции для продуктов
    const handleAddProduct = async (values) => {
        try {
            const productData = {
                ...values,
                photo: photoUrl
            };

            const response = await fetch(config.API_URL + "/api/products", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
                credentials: "include"
            });

            if (response.ok) {
                message.success('Продукт успешно добавлен');
                setAddProductModal(false);
                productForm.resetFields();
                setPhotoUrl('');
                fetchProducts();
            } else {
                const errorData = await response.json();
                message.error(errorData.detail || 'Ошибка при добавлении продукта');
            }
        } catch (error) {
            message.error('Ошибка при добавлении продукта');
        }
    };

    const handleEditProduct = async (values) => {
        try {
            const productData = {
                ...values,
                photo: editingPhotoUrl || editingProduct?.photo
            };

            const response = await fetch(config.API_URL + `/api/products/${editingProduct.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
                credentials: "include"
            });

            if (response.ok) {
                message.success('Продукт успешно обновлен');
                setEditProductModal(false);
                setEditingProduct(null);
                setEditingPhotoUrl('');
                editProductForm.resetFields();
                fetchProducts();
            } else {
                const errorData = await response.json();
                message.error(errorData.detail || 'Ошибка при обновлении продукта');
            }
        } catch (error) {
            message.error('Ошибка при обновлении продукта');
        }
    };

    const handleDeleteProduct = async (id) => {
        try {
            const response = await fetch(config.API_URL + `/api/products/${id}`, {
                method: 'DELETE',
                credentials: "include"
            });

            if (response.ok) {
                message.success('Продукт успешно удален');
                fetchProducts();
            } else {
                message.error('Ошибка при удалении продукта');
            }
        } catch (error) {
            message.error('Ошибка при удалении продукта');
        }
    };

    // Функции для категорий
    const handleAddCategory = async (values) => {
        try {
            const categoryData = {
                ...values,
                photo: photoUrl
            };
            const response = await fetch(config.API_URL + "/api/categories/", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(categoryData),
                credentials: "include"
            });

            if (response.ok) {
                message.success('Категория успешно добавлена');
                setAddCategoryModal(false);
                categoryForm.resetFields();
                fetchCategories();
            } else {
                const errorData = await response.json();
                message.error(errorData.detail || 'Ошибка при добавлении категории');
            }
        } catch (error) {
            message.error('Ошибка при добавлении категории');
        }
    };

    const handleEditCategory = async (values) => {
        try {
            const categoryData = {
                ...values,
                photo: editingPhotoUrl
            };
            const response = await fetch(config.API_URL + `/api/categories/${editingCategory.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(categoryData),
                credentials: "include"
            });

            if (response.ok) {
                message.success('Категория успешно обновлена');
                setEditCategoryModal(false);
                setEditingCategory(null);
                editCategoryForm.resetFields();
                fetchCategories();
            } else {
                const errorData = await response.json();
                message.error(errorData.detail || 'Ошибка при обновлении категории');
            }
        } catch (error) {
            message.error('Ошибка при обновлении категории');
        }
    };

    const handleDeleteCategory = async (id) => {
        try {
            const response = await fetch(config.API_URL + `/api/categories/${id}`, {
                method: 'DELETE',
                credentials: "include"
            });

            if (response.ok) {
                message.success('Категория успешно удалена');
                fetchCategories();
            } else {
                message.error('Ошибка при удалении категории');
            }
        } catch (error) {
            message.error('Ошибка при удалении категории');
        }
    };

    const handleUploadPhoto = async (file, isEditing = false) => {
        const setUrl = isEditing ? setEditingPhotoUrl : setPhotoUrl;
        const loadingState = setUploadingPhoto;

        loadingState(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(config.API_URL + "/api/files", {
                method: 'POST',
                body: formData,
                credentials: "include"
            });

            if (response.ok) {
                const data = await response.json();
                setUrl(data.url);
                message.success('Фото успешно загружено');
            } else {
                message.error('Ошибка при загрузке фото');
            }
        } catch (error) {
            message.error('Ошибка при загрузке фото');
        } finally {
            loadingState(false);
        }

        return false;
    };

    const openEditProductModal = (product) => {
        setEditingProduct(product);
        setEditingPhotoUrl(product.photo || '');
        editProductForm.setFieldsValue({
            ...product,
            category_id: product.category_id || undefined
        });
        setEditProductModal(true);
    };

    const openEditCategoryModal = (category) => {
        setEditingCategory(category);
        editCategoryForm.setFieldsValue(category);
        setEditCategoryModal(true);
    };

    const showDetails = (record, type) => {
        setDetailData(record);
        setDetailType(type);
        setDetailModal(true);
    };

    // Колонки для таблицы пользователей
    const userColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Имя',
            dataIndex: 'first_name',
            key: 'first_name',
        },
        {
            title: 'Фамилия',
            dataIndex: 'last_name',
            key: 'last_name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Роль',
            dataIndex: 'role',
            key: 'role',
            render: (role) => {
                const roles = {
                    1: 'Пользователь',
                    2: 'Курьер',
                    3: 'Повар',
                    4: 'Админ'
                };
                return roles[role] || role;
            }
        },
        {
            title: 'Дата рождения',
            dataIndex: 'birthday',
            key: 'birthday',
            render: (date) => date ? new Date(date).toLocaleDateString() : '-'
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button type="link" icon={<EyeOutlined />} onClick={() => showDetails(record, 'user')} />
                    <Button type="link" icon={<EditOutlined />} onClick={() => openEditUserModal(record)} />
                    <Popconfirm
                        title="Удалить пользователя?"
                        onConfirm={() => handleDeleteUser(record.id)}
                        okText="Да"
                        cancelText="Нет"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        },
    ];

    // Колонки для таблицы заказов
    const orderColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Дата создания',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => new Date(date).toLocaleString(),
            sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
        },
        {
            title: 'ID клиента',
            dataIndex: 'creator_id',
            key: 'creator_id',
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            key: 'status',
        },
        {
            title: 'Сумма',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => `${amount} ₽`
        },
        {
            title: 'Адрес',
            dataIndex: 'address',
            key: 'address',
            render: (address) => address ?
                `${address.city}, ${address.street}, д.${address.house_number}` : '-'
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (_, record) => (
                <Button type="link" onClick={() => showDetails(record, 'order')}>
                </Button>
            )
        }
    ];

    // Колонки для таблицы платежей
    const paymentColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Сумма',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => `${amount} ₽`
        },
        {
            title: 'Описание',
            dataIndex: 'label',
            key: 'label',
        },
        {
            title: 'ID заказа',
            dataIndex: 'order_id',
            key: 'order_id',
        },
        {
            title: 'ID пользователя',
            dataIndex: 'user_id',
            key: 'user_id',
        },
        {
            title: 'Метод',
            dataIndex: 'method',
            key: 'method',
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            key: 'status',
        }
    ];

    const categoriesColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            sorter: (a, b) => a.id - b.id
        },
        {
            title: 'Название',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Фото',
            dataIndex: 'photo',
            key: 'photo',
            render: (photo) => photo ? (
                <img src={photo} alt="category" style={{width: 50, height: 50, objectFit: 'cover'}}/>
            ) : '-'
        },
        {
            title: 'Слаг',
            dataIndex: 'slug',
            key: 'slug',
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => openEditCategoryModal(record)}
                    >
                    </Button>
                    <Popconfirm
                        title="Удалить категорию?"
                        description="Вы уверены, что хотите удалить эту категорию?"
                        onConfirm={() => handleDeleteCategory(record.id)}
                        okText="Да"
                        cancelText="Нет"
                    >
                        <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                        >
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const addressesColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Юзер',
            dataIndex: 'user_id',
            key: 'user_id',
            sorter: (a, b) => a.user_id - b.user_id,
        },
        {
            title: 'Город',
            dataIndex: 'city',
            key: 'city',
        },{
            title: 'Улица',
            dataIndex: 'street',
            key: 'street',
        },{
            title: 'Номер дома',
            dataIndex: 'house_number',
            key: 'house_number',
        },{
            title: 'Подъезд',
            dataIndex: 'entrance',
            key: 'entrance',
        },{
            title: 'Этаж',
            dataIndex: 'floor',
            key: 'floor',
        },
        {
            title: 'Квартира',
            dataIndex: 'apartment_number',
            key: 'apartment_number',
        },{
            title: 'Комментарий',
            dataIndex: 'comment',
            key: 'comment',
        },{
            title: 'Оставить у двери',
            dataIndex: 'is_leave_at_door',
            key: 'is_leave_at_door',
            render: (value) => value ? 'Да' : 'Нет'
        }
    ];

    // Колонки для таблицы продуктов
    const productColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Название',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Цена',
            dataIndex: 'price',
            key: 'price',
            render: (price, record) => (
                <span>
                    {record.discount_price ? (
                        <>
                            <span style={{textDecoration: 'line-through', color: '#999'}}>
                                {price} ₽
                            </span>
                            <span style={{color: '#ff4d4f', marginLeft: 8}}>
                                {record.discount_price} ₽
                            </span>
                        </>
                    ) : (
                        `${price} ₽`
                    )}
                </span>
            ),
            sorter: (a, b) => a.price - b.price,
        },
        {
            title: 'Количество',
            dataIndex: 'count',
            key: 'count',
        },
        {
            title: 'Категория',
            dataIndex: 'category_id',
            key: 'category_id',
            render: (categoryId) => {
                const category = categories.find(c => c.id === categoryId);
                return category ? category.name : categoryId;
            }
        },
        {
            title: 'Фото',
            dataIndex: 'photo',
            key: 'photo',
            render: (photo) => photo ? (
                <img src={photo} alt="product" style={{width: 50, height: 50, objectFit: 'cover'}}/>
            ) : '-'
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => showDetails(record, 'product')}
                    >
                    </Button>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => openEditProductModal(record)}
                    >
                    </Button>
                    <Popconfirm
                        title="Удалить продукт?"
                        description="Вы уверены, что хотите удалить этот продукт?"
                        onConfirm={() => handleDeleteProduct(record.id)}
                        okText="Да"
                        cancelText="Нет"
                    >
                        <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                        >
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    // Данные для графиков
    const userChartData = [
        {name: 'Сегодня', value: userStats.today},
        {name: '7 дней', value: userStats.week},
        {name: 'Месяц', value: userStats.month},
        {name: 'Год', value: userStats.year}
    ];

    const orderChartData = [
        {name: 'Сегодня', value: orderStats.today},
        {name: '7 дней', value: orderStats.week},
        {name: 'Месяц', value: orderStats.month},
        {name: 'Год', value: orderStats.year}
    ];

    const paymentChartData = [
        {name: 'Сегодня', value: paymentStats.today},
        {name: '7 дней', value: paymentStats.week},
        {name: 'Месяц', value: paymentStats.month},
        {name: 'Год', value: paymentStats.year}
    ];

    const productChartData = [
        {name: 'Сегодня', value: productStats.today},
        {name: '7 дней', value: productStats.week},
        {name: 'Месяц', value: productStats.month},
        {name: 'Год', value: productStats.year}
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div style={{display: 'flex', minHeight: '100vh'}}>
            {/* Левое меню */}
            <Layout.Sider width={260} style={{background: '#001529', paddingTop: 20}}>
                <div style={{color: 'white', padding: '0 24px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)'}}>
                    <h2 style={{color: 'white', margin: 0}}>Админ-панель</h2>
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[activeTab]}
                    onClick={({ key }) => setActiveTab(key)}
                    style={{borderRight: 0}}
                >
                    <Menu.Item key="1" icon={<UserOutlined />}>Пользователи</Menu.Item>
                    <Menu.Item key="2" icon={<ShoppingCartOutlined />}>Заказы</Menu.Item>
                    <Menu.Item key="3" icon={<DollarOutlined />}>Покупки</Menu.Item>
                    <Menu.Item key="4" icon={<ProductOutlined />}>Продукты</Menu.Item>
                    <Menu.Item key="5" icon={<CalculatorFilled />}>Категории</Menu.Item>
                    <Menu.Item key="6" icon={<HeatMapOutlined />}>Адреса</Menu.Item>
                </Menu>
            </Layout.Sider>

            {/* Основной контент */}
            <div style={{flex: 1, padding: 24, background: '#f0f2f5'}}>
                {activeTab === '1' && (
                    <div>
                        <h2>Пользователи</h2>
                        <Row gutter={[16, 16]} style={{marginBottom: 24}}>
                            <Col span={6}>
                                <Card>
                                    <Statistic title="Сегодня" value={userStats.today}/>
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic title="За 7 дней" value={userStats.week}/>
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic title="За месяц" value={userStats.month}/>
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic title="За год" value={userStats.year}/>
                                </Card>
                            </Col>
                        </Row>

                        <div style={{background: 'white', padding: 24, marginBottom: 24, borderRadius: 8}}>
                            <h3>Статистика новых пользователей</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={userChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {userChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                        ))}
                                    </Pie>
                                    <Tooltip/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div style={{background: 'white', padding: 24, borderRadius: 8}}>
                            <h3>Список пользователей</h3>
                            <div style={{marginBottom: 16}}>
                                <Button type="primary" icon={<PlusOutlined/>} onClick={() => setAddUserModal(true)}>
                                    Добавить пользователя
                                </Button>
                            </div>
                            <Table
                                dataSource={users}
                                columns={userColumns}
                                loading={usersLoading}
                                rowKey="id"
                                pagination={{pageSize: 10}}
                            />
                        </div>
                    </div>
                )}

                {activeTab === '2' && (
                    <div>
                        <h2>Заказы</h2>
                        <Row gutter={[16, 16]} style={{marginBottom: 24}}>
                            <Col span={6}>
                                <Card>
                                    <Statistic title="Сегодня" value={orderStats.today}/>
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic title="За 7 дней" value={orderStats.week}/>
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic title="За месяц" value={orderStats.month}/>
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic title="За год" value={orderStats.year}/>
                                </Card>
                            </Col>
                        </Row>

                        <div style={{background: 'white', padding: 24, marginBottom: 24, borderRadius: 8}}>
                            <h3>Статистика заказов</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={orderChartData}>
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis dataKey="name"/>
                                    <YAxis/>
                                    <Tooltip/>
                                    <Legend/>
                                    <Bar dataKey="value" fill="#8884d8"/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div style={{background: 'white', padding: 24, borderRadius: 8}}>
                            <h3>Список заказов</h3>
                            <Table
                                dataSource={orders}
                                columns={orderColumns}
                                loading={ordersLoading}
                                rowKey="id"
                                pagination={{pageSize: 10}}
                            />
                        </div>
                    </div>
                )}

                {activeTab === '3' && (
                    <div>
                        <h2>Покупки</h2>
                        <Row gutter={[16, 16]} style={{marginBottom: 24}}>
                            <Col span={6}>
                                <Card>
                                    <Statistic
                                        title="Сегодня"
                                        value={paymentStats.today}
                                        prefix="₽"
                                        valueStyle={{color: '#3f8600'}}
                                    />
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic
                                        title="За 7 дней"
                                        value={paymentStats.week}
                                        prefix="₽"
                                        valueStyle={{color: '#3f8600'}}
                                    />
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic
                                        title="За месяц"
                                        value={paymentStats.month}
                                        prefix="₽"
                                        valueStyle={{color: '#3f8600'}}
                                    />
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic
                                        title="За год"
                                        value={paymentStats.year}
                                        prefix="₽"
                                        valueStyle={{color: '#3f8600'}}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        <div style={{background: 'white', padding: 24, marginBottom: 24, borderRadius: 8}}>
                            <h3>Статистика платежей</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={paymentChartData}>
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis dataKey="name"/>
                                    <YAxis/>
                                    <Tooltip/>
                                    <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8"/>
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div style={{background: 'white', padding: 24, borderRadius: 8}}>
                            <h3>Список платежей</h3>
                            <Table
                                dataSource={payments}
                                columns={paymentColumns}
                                loading={paymentsLoading}
                                rowKey="id"
                                pagination={{pageSize: 10}}
                            />
                        </div>
                    </div>
                )}

                {activeTab === '4' && (
                    <div>
                        <h2>Продукты</h2>

                        <div style={{marginBottom: 24}}>
                            <Button
                                type="primary"
                                icon={<PlusOutlined/>}
                                onClick={() => setAddProductModal(true)}
                            >
                                Добавить продукт
                            </Button>
                        </div>

                        <Row gutter={[16, 16]} style={{marginBottom: 24}}>
                            <Col span={6}>
                                <Card>
                                    <Statistic title="Сегодня" value={productStats.today}/>
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic title="За 7 дней" value={productStats.week}/>
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic title="За месяц" value={productStats.month}/>
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic title="За год" value={productStats.year}/>
                                </Card>
                            </Col>
                        </Row>

                        <div style={{background: 'white', padding: 24, borderRadius: 8}}>
                            <h3>Список продуктов</h3>
                            <Table
                                dataSource={products}
                                columns={productColumns}
                                loading={productsLoading}
                                rowKey="id"
                                pagination={{pageSize: 10}}
                            />
                        </div>
                    </div>
                )}

                {activeTab === '5' && (
                    <div>
                        <h2>Категории</h2>

                        <div style={{marginBottom: 24}}>
                            <Button
                                type="primary"
                                icon={<PlusOutlined/>}
                                onClick={() => setAddCategoryModal(true)}
                            >
                                Добавить категорию
                            </Button>
                        </div>

                        <div style={{background: 'white', padding: 24, borderRadius: 8}}>
                            <Table
                                dataSource={categories}
                                columns={categoriesColumns}
                                loading={productsLoading}
                                rowKey="id"
                                pagination={{pageSize: 10}}
                            />
                        </div>
                    </div>
                )}

                {activeTab === '6' && (
                    <div>
                        <h2>Адреса</h2>

                        <div style={{background: 'white', padding: 24, borderRadius: 8}}>
                            <Table
                                dataSource={addresses}
                                columns={addressesColumns}
                                loading={productsLoading}
                                rowKey="id"
                                pagination={{pageSize: 10}}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Модальное окно добавления продукта */}
            <Modal
                title="Добавить продукт"
                open={addProductModal}
                onCancel={() => {
                    setAddProductModal(false);
                    productForm.resetFields();
                    setPhotoUrl('');
                }}
                onOk={() => productForm.submit()}
                width={700}
            >
                <Form
                    form={productForm}
                    layout="vertical"
                    onFinish={handleAddProduct}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Название"
                                rules={[{required: true, message: 'Введите название'}]}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="price"
                                label="Цена"
                                rules={[{required: true, message: 'Введите цену'}]}
                            >
                                <InputNumber min={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="content" label="Описание">
                        <TextArea rows={3}/>
                    </Form.Item>

                    <Form.Item name="composition" label="Состав">
                        <TextArea rows={3}/>
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="count" label="Количество">
                                <InputNumber min={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="grams" label="Вес (г)">
                                <InputNumber min={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="category_id"
                                label="Категория"
                            >
                                <Select placeholder="Выберите категорию">
                                    {categories.map(cat => (
                                        <Option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={6}>
                            <Form.Item name="protein" label="Белки">
                                <InputNumber min={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="fats" label="Жиры">
                                <InputNumber min={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="carbohydrates" label="Углеводы">
                                <InputNumber min={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="kilocalorie" label="Калории">
                                <InputNumber min={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="discount_price" label="Цена со скидкой">
                                <InputNumber min={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="discount" label="Скидка (%)">
                                <InputNumber min={0} max={100} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="quantity" label="Количество для скидки">
                                <InputNumber min={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="Фото">
                        <Upload
                            beforeUpload={(file) => handleUploadPhoto(file, false)}
                            showUploadList={false}
                        >
                            <Button icon={<UploadOutlined/>} loading={uploadingPhoto}>
                                Загрузить фото
                            </Button>
                        </Upload>
                        {photoUrl && (
                            <div style={{marginTop: 16}}>
                                <img
                                    src={photoUrl}
                                    alt="Preview"
                                    style={{maxWidth: 200, maxHeight: 200, objectFit: 'cover'}}
                                />
                            </div>
                        )}
                    </Form.Item>
                </Form>
            </Modal>

            {/* Модальное окно редактирования продукта */}
            <Modal
                title="Редактировать продукт"
                open={editProductModal}
                onCancel={() => {
                    setEditProductModal(false);
                    setEditingProduct(null);
                    setEditingPhotoUrl('');
                    editProductForm.resetFields();
                }}
                onOk={() => editProductForm.submit()}
                width={700}
            >
                <Form
                    form={editProductForm}
                    layout="vertical"
                    onFinish={handleEditProduct}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Название"
                                rules={[{required: true, message: 'Введите название'}]}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="price"
                                label="Цена"
                                rules={[{required: true, message: 'Введите цену'}]}
                            >
                                <InputNumber min={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="content" label="Описание">
                        <TextArea rows={3}/>
                    </Form.Item>

                    <Form.Item name="composition" label="Состав">
                        <TextArea rows={3}/>
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="count" label="Количество">
                                <InputNumber min={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="grams" label="Вес (г)">
                                <InputNumber min={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="category_id"
                                label="Категория"
                            >
                                <Select placeholder="Выберите категорию">
                                    {categories.map(cat => (
                                        <Option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={6}>
                            <Form.Item name="protein" label="Белки">
                                <InputNumber min={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="fats" label="Жиры">
                                <InputNumber min={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="carbohydrates" label="Углеводы">
                                <InputNumber min={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="kilocalorie" label="Калории">
                                <InputNumber min={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="discount_price" label="Цена со скидкой">
                                <InputNumber min={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="discount" label="Скидка (%)">
                                <InputNumber min={0} max={100} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="quantity" label="Количество для скидки">
                                <InputNumber min={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="Фото">
                        <Upload
                            beforeUpload={(file) => handleUploadPhoto(file, true)}
                            showUploadList={false}
                        >
                            <Button icon={<UploadOutlined/>} loading={uploadingPhoto}>
                                Загрузить новое фото
                            </Button>
                        </Upload>

                        {(editingPhotoUrl || editingProduct?.photo) && (
                            <div style={{marginTop: 16}}>
                                <p>Текущее фото:</p>
                                <img
                                    src={editingPhotoUrl || editingProduct?.photo}
                                    alt="Preview"
                                    style={{maxWidth: 200, maxHeight: 200, objectFit: 'cover'}}
                                />
                            </div>
                        )}
                    </Form.Item>
                </Form>
            </Modal>

            {/* Модальное окно добавления категории */}
            <Modal
                title="Добавить категорию"
                open={addCategoryModal}
                onCancel={() => {
                    setAddCategoryModal(false);
                    categoryForm.resetFields();
                }}
                onOk={() => categoryForm.submit()}
                width={500}
            >
                <Form
                    form={categoryForm}
                    layout="vertical"
                    onFinish={handleAddCategory}
                >
                    <Form.Item
                        name="name"
                        label="Название"
                        rules={[{required: true, message: 'Введите название'}]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item label="Фото">
                        <Upload
                            beforeUpload={(file) => handleUploadPhoto(file, false)}
                            showUploadList={false}
                        >
                            <Button icon={<UploadOutlined/>} loading={uploadingPhoto}>
                                Загрузить фото
                            </Button>
                        </Upload>
                        {photoUrl && (
                            <div style={{marginTop: 16}}>
                                <img
                                    src={photoUrl}
                                    alt="Preview"
                                    style={{maxWidth: 200, maxHeight: 200, objectFit: 'cover'}}
                                />
                            </div>
                        )}
                    </Form.Item>
                </Form>
            </Modal>

            {/* Модальное окно редактирования категории */}
            <Modal
                title="Редактировать категорию"
                open={editCategoryModal}
                onCancel={() => {
                    setEditCategoryModal(false);
                    setEditingCategory(null);
                    editCategoryForm.resetFields();
                }}
                onOk={() => editCategoryForm.submit()}
                width={500}
            >
                <Form
                    form={editCategoryForm}
                    layout="vertical"
                    onFinish={handleEditCategory}
                >
                    <Form.Item
                        name="name"
                        label="Название"
                        rules={[{required: true, message: 'Введите название'}]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        name="slug"
                        label="Слаг (URL)"
                        rules={[{required: false, message: 'Введите слаг'}]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item label="Фото">
                        <Upload
                            beforeUpload={(file) => handleUploadPhoto(file, true)}
                            showUploadList={false}
                        >
                            <Button icon={<UploadOutlined/>} loading={uploadingPhoto}>
                                Загрузить новое фото
                            </Button>
                        </Upload>

                        {(editingPhotoUrl || editingCategory?.photo) && (
                            <div style={{marginTop: 16}}>
                                <p>Текущее фото:</p>
                                <img
                                    src={editingPhotoUrl || editingCategory?.photo}
                                    alt="Preview"
                                    style={{maxWidth: 200, maxHeight: 200, objectFit: 'cover'}}
                                />
                            </div>
                        )}
                    </Form.Item>
                </Form>
            </Modal>

            {/* Модальное окно добавления пользователя */}
            <Modal
                title="Добавить пользователя"
                open={addUserModal}
                onCancel={() => { setAddUserModal(false); userForm.resetFields(); }}
                onOk={() => userForm.submit()}
                width={700}
            >
                <Form form={userForm} layout="vertical" onFinish={handleAddUser}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="first_name" label="Имя" rules={[{required: true}]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="last_name" label="Фамилия">
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="email" label="Email" rules={[{required: true, type: 'email'}]}>
                        <Input />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="password" label="Пароль" rules={[{required: true}]}>
                                <Input.Password />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="role" label="Роль" initialValue={1}>
                                <Select>
                                    <Option value={1}>Пользователь</Option>
                                    <Option value={2}>Курьер</Option>
                                    <Option value={3}>Повар</Option>
                                    <Option value={4}>Админ</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            {/* Модальное окно редактирования пользователя */}
            <Modal
                title="Редактировать пользователя"
                open={editUserModal}
                onCancel={() => { setEditUserModal(false); setEditingUser(null); editUserForm.resetFields(); }}
                onOk={() => editUserForm.submit()}
                width={700}
            >
                <Form form={editUserForm} layout="vertical" onFinish={handleEditUser}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="first_name" label="Имя" rules={[{required: true}]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="last_name" label="Фамилия">
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="email" label="Email" rules={[{required: true, type: 'email'}]}>
                        <Input />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="role" label="Роль">
                                <Select>
                                    <Option value={1}>Пользователь</Option>
                                    <Option value={2}>Курьер</Option>
                                    <Option value={3}>Повар</Option>
                                    <Option value={4}>Админ</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="birthday" label="Дата рождения">
                                <DatePicker style={{width: '100%'}} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            {/* Модальное окно деталей */}
            <Modal
                title={`Детали ${detailType === 'user' ? 'пользователя' :
                    detailType === 'order' ? 'заказа' :
                        detailType === 'payment' ? 'платежа' :
                            detailType === 'product' ? 'продукта' : 'элемента'}`}
                open={detailModal}
                onCancel={() => setDetailModal(false)}
                footer={null}
                width={1200}
            >
                {detailData && (
                    <pre style={{background: '#f5f5f5', padding: 16, borderRadius: 8, maxHeight: 400, overflow: 'auto'}}>
                        {JSON.stringify(detailData, null, 2)}
                    </pre>
                )}
            </Modal>
        </div>
    );
}

export default Admin;