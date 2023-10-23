import { useGenUrl } from '../../routing/routing';

export const useGetParentPageUrl = () => {
    const genUrl = useGenUrl();
    return (parentOrgUnitId?: number | string): string =>
        genUrl({
            parentId: parentOrgUnitId ? `${parentOrgUnitId}` : undefined,
            page: null,
        });
};
