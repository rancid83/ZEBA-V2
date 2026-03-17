import LayoutWrapper from '@/components/LayoutWrapper/LayoutWrapper';

const Layout = (props: { children: React.ReactNode }) => {
  return <LayoutWrapper>{props.children}</LayoutWrapper>;
};

export default Layout;
