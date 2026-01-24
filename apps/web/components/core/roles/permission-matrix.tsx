import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionPrimitive,
  Checkbox,
  Label,
} from '@bizflow/ui';
import type { PermissionData } from '@/services/roles.service';
import { ChevronDown } from 'lucide-react';
import { cn } from '@bizflow/ui/utils';

interface PermissionMatrixProps {
  data: PermissionData;
  selectedPermissions: { module: string; action: string }[];
  onChange: (permissions: { module: string; action: string }[]) => void;
  disabled?: boolean;
}

export function PermissionMatrix({
  data,
  selectedPermissions,
  onChange,
  disabled = false,
}: PermissionMatrixProps) {
  const { modules, actions } = data;

  const getPermission = (module: string, action: string) => {
    return selectedPermissions.find(
      (p) => p.module === module && p.action === action,
    );
  };

  const isModuleSelected = (module: string) => {
    const modulePermissions = selectedPermissions.filter(
      (p) => p.module === module,
    );
    return modulePermissions.length === actions.length;
  };

  const isModuleIndeterminate = (module: string) => {
    const modulePermissions = selectedPermissions.filter(
      (p) => p.module === module,
    );
    return (
      modulePermissions.length > 0 && modulePermissions.length < actions.length
    );
  };

  const handleModuleToggle = (module: string) => {
    if (isModuleSelected(module)) {
      // Unselect all
      const newPermissions = selectedPermissions.filter(
        (p) => p.module !== module,
      );
      onChange(newPermissions);
    } else {
      // Select all
      const otherPermissions = selectedPermissions.filter(
        (p) => p.module !== module,
      );
      const newModulePermissions = actions.map((action) => ({
        module,
        action,
      }));
      onChange([...otherPermissions, ...newModulePermissions]);
    }
  };

  const handleActionToggle = (module: string, action: string) => {
    const existing = getPermission(module, action);
    if (existing) {
      onChange(
        selectedPermissions.filter(
          (p) => !(p.module === module && p.action === action),
        ),
      );
    } else {
      onChange([...selectedPermissions, { module, action }]);
    }
  };

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-muted/10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium">Hak Akses</h3>
          <p className="text-sm text-muted-foreground">
            Atur hak akses untuk role ini berdasarkan modul dan aksi.
          </p>
        </div>
      </div>

      <Accordion type="multiple" className="w-full">
        {modules.map((module) => (
          <AccordionItem value={module} key={module}>
            <AccordionPrimitive.Header className="flex items-center justify-between py-4 font-medium transition-all [&[data-state=open]>button>svg]:rotate-180 hover:no-underline px-4 bg-card hover:bg-accent/50 rounded-lg mb-2 border">
              <div
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox
                  id={`module-${module}`}
                  checked={
                    isModuleSelected(module) ||
                    (isModuleIndeterminate(module) ? 'indeterminate' : false)
                  }
                  onCheckedChange={() => handleModuleToggle(module)}
                  disabled={disabled}
                />
                <Label
                  htmlFor={`module-${module}`}
                  className="cursor-pointer font-semibold capitalize"
                >
                  {module}
                </Label>
              </div>
              <AccordionPrimitive.Trigger
                className={cn(
                  'flex flex-1 items-center justify-end py-2 font-medium transition-all [&[data-state=open]>svg]:rotate-180',
                )}
              >
                <div className="flex items-center gap-4 mr-2">
                  <div className="text-xs text-muted-foreground no-underline">
                    {
                      selectedPermissions.filter((p) => p.module === module)
                        .length
                    }{' '}
                    / {actions.length} akses
                  </div>
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                </div>
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            <AccordionContent className="pt-2 pb-4 px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {actions.map((action) => (
                  <div
                    key={`${module}-${action}`}
                    className="flex items-center space-x-2 border p-3 rounded-md bg-white dark:bg-zinc-950"
                  >
                    <Checkbox
                      id={`${module}-${action}`}
                      checked={!!getPermission(module, action)}
                      onCheckedChange={() => handleActionToggle(module, action)}
                      disabled={disabled}
                    />
                    <Label
                      htmlFor={`${module}-${action}`}
                      className="cursor-pointer flex-1 flex items-center justify-between"
                    >
                      <span className="capitalize">{action}</span>
                      {/* <Badge variant="secondary" className={getActionColor(action)}>
                        {action}
                      </Badge> */}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
